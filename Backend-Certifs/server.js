const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.endsWith(":3000")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(fileUpload());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const db = mysql.createConnection({
  host: "localhost",
  port: 4406,
  user: "root",
  password: "3911",
  database: "certificate_medical",
  timezone: "Z",
});
const isAdmin = (req, res, next) => {
  if (req.admin === 2) {
    return next();
  } else {
    return res.status(403).json({
      Error:
        "You are not authorized to perform this action, Only Admins can performe and access this spesific methodes",
    });
  }
};
const vuser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ Error: "You are not authenticated" });
  }
  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(402).json({ Error: "Token has expired" });
      } else {
        return res.status(404).json({ Error: "Invalid token" });
      }
    }
    req.user = {
      id: decoded.id,
      name: decoded.name,
      admin: decoded.admin,
    };
    req.admin = decoded.admin;
    const sql = `
      SELECT *
      FROM users
      WHERE id = ?
    `;
    db.query(sql, [decoded.id], (err, result) => {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ Error: "Internal server error" });
      }
      if (result.length === 0) {
        res.clearCookie("token");
        return res.status(403).json({ Error: "User does not exist" });
      }
      next();
    });
  });
};
app.get("/", vuser, (req, res) => {
  return res.json({
    Status: "Success",
    id: req.user.id,
    name: req.user.name,
    admin: req.user.admin,
  });
});

// ---------------------------- Images/PDF ----------------------------------------------------
app.post("/upload-image", vuser, (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const imgFile = req.files.img;
  const id = req.body.id;
  const fileExtension = path.extname(imgFile.name);

  const uploadPath = path.join(__dirname, "public", "images", imgFile.name);

  imgFile.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error saving the file:", err);
      return res.status(500).send(err);
    }

    const sql = `
      INSERT INTO images (filename, patient_id, url)
      VALUES (?, ?, ?)
    `;
    const urlPath = `/images/${imgFile.name}`;

    db.query(sql, [fileExtension, id, urlPath], (err, result) => {
      if (err) {
        console.error("Error inserting image record:", err);
        return res.status(500).send(err);
      }

      res.send("Image uploaded successfully.");
    });
  });
});
app.get("/images/:patientId", vuser, (req, res) => {
  const { patientId } = req.params;
  const sql = "SELECT * FROM images WHERE patient_id = ?";
  db.query(sql, [patientId], (err, data) => {
    if (err) {
      console.error("Error fetching images:", err);
      return res.status(500).json({ error: "Error fetching images" });
    }
    return res.json(data);
  });
});
app.delete("/images/:id", (req, res) => {
  const imgId = req.params.id;
  const fetchImageSql = "SELECT * FROM images WHERE id = ?";
  db.query(fetchImageSql, [imgId], (err, result) => {
    if (err) {
      console.error("Error fetching image details:", err);
      return res.status(500).json({ error: "Error fetching image details" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    const image = result[0];
    const imagePath = path.join(__dirname, "public", image.url);
    const deleteImageSql = "DELETE FROM images WHERE id = ?";
    db.query(deleteImageSql, [imgId], (err, deleteResult) => {
      if (err) {
        console.error("Error deleting image from database:", err);
        return res
          .status(500)
          .json({ error: "Error deleting image from database" });
      }
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
          return res.status(500).json({ error: "Error deleting image file" });
        }
        return res.json({
          message: "Image deleted successfully",
          affectedRows: deleteResult.affectedRows,
        });
      });
    });
  });
});

// ---------------------------- Certifs ----------------------------------------------------
app.post("/certificate", vuser, (req, res) => {
  const {
    patientId,
    date_depot,
    date_debut,
    date_fin,
    contreVisit,
    dateCV,
    fait,
    resultat,
    explication,
    type,
    created_by,
    year,
    spdsInput,
    mtsInput,
    provInput,
    duree,
  } = req.body;

  const insertCertificateQuery = `
    INSERT INTO certificates (
      patient_id, 
      date_depot, 
      date_debut, 
      date_fin, 
      contre_visit, 
      date_cv, 
      fait, 
      resultat, 
      explication, 
      type_conge, 
      created_by,
      year,
      spd,
      mt,
      prov,
      duration
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    patientId,
    date_depot,
    date_debut,
    date_fin,
    contreVisit,
    dateCV || null,
    fait || null,
    resultat || null,
    explication || null,
    type || null,
    created_by,
    year,
    spdsInput || null,
    mtsInput || null,
    provInput || null,
    duree,
  ];

  db.query(insertCertificateQuery, values, (err, result) => {
    if (err) {
      console.error("Error adding Certificate:", err);
      return res.status(500).json({ error: "Error adding Certificate" });
    }
    console.log("Certificate added successfully");
    return res.json({ message: "Certificate added successfully" });
  });
});
app.put("/certificate/:id", vuser, (req, res) => {
  const { id } = req.params;
  const {
    contreVisit,
    dateCV,
    fait,
    resultat,
    explication,
    type,
    spdsInput,
    mtsInput,
    provInput,
  } = req.body;

  const dateCVValue = contreVisit === "0" ? null : dateCV;
  const sql = `
        UPDATE certificates 
        SET 
        contre_visit = ?,
        date_cv = ?,
        fait = ?,
        resultat = ?,
        explication = ?,
        type_conge = ?,
        spd = ?,
        mt = ?,
        prov = ?
        WHERE id = ?
      `;
  const values = [
    contreVisit,
    dateCVValue || null,
    fait || null,
    resultat || null,
    explication || null,
    type || null,
    spdsInput || null,
    mtsInput || null,
    provInput || null,
    id,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating Certificate:", err);
      return res.status(500).json({ error: "Error updating Certificate" });
    }
    console.log("Certificate updated successfully");
    return res.json({ message: "Certificate updated successfully" });
  });
});
app.get("/certificate/", vuser, (req, res) => {
  const sql = "SELECT * FROM certificates";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/certificate-all", vuser, (req, res) => {
  const { annee } = req.query; // Get the 'annee' parameter from query

  const sql = `
      SELECT 
          c.*, 
          p.nom AS patient_nom,
          p.prenom AS patient_prenom,
          p.address AS patient_address,
          p.cin AS patient_cin,
          p.ppr AS patient_ppr,
          p.phone AS patient_phone,
          p.created_date AS patient_created_date
      FROM certificates c
      INNER JOIN patients p ON c.patient_id = p.id
      ${annee === "*" ? "" : "WHERE c.year = ?"}
  `;

  const params = annee === "*" ? [] : [annee]; // No params if selecting all

  db.query(sql, params, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/certificate/:id", vuser, (req, res) => {
  const { id } = req.params;
  const { annee } = req.query;

  let sql = `
    SELECT 
      c.*, 
      p.nom AS patient_nom, 
      p.prenom AS patient_prenom, 
      p.address AS patient_address, 
      p.cin AS patient_cin, 
      p.ppr AS patient_ppr, 
      p.phone AS patient_phone, 
      p.created_date AS patient_created_date 
    FROM certificates c 
    INNER JOIN patients p ON c.patient_id = p.id 
    WHERE c.patient_id = ?
  `;

  let params = [id];

  if (annee && annee !== "*") {
    sql += " AND YEAR(c.date_debut) = ?";
    params.push(annee);
  }

  db.query(sql, params, (err, data) => {
    if (err) {
      console.error("Error fetching certificate data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.json(data);
  });
});
app.get("/certificate-years/:id", vuser, (req, res) => {
  const { id } = req.params;
  const sql =
    "SELECT DISTINCT year FROM certificates WHERE patient_id = ? ORDER BY year DESC";
  const params = [id];

  db.query(sql, params, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/certificate-years", vuser, (req, res) => {
  const sql = "SELECT DISTINCT year FROM certificates ORDER BY year DESC";

  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/certificate-active/:id", vuser, (req, res) => {
  const { id } = req.params;
  let sql =
    "SELECT * FROM certificates WHERE patient_id = ? ORDER BY date_fin DESC LIMIT 1";
  let params = [id];

  db.query(sql, params, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
const alterColumnsSQL = `
ALTER TABLE certificates 
MODIFY contre_visit VARCHAR(255),
MODIFY fait VARCHAR(255),
MODIFY resultat VARCHAR(255),
MODIFY explication VARCHAR(255),
MODIFY type_conge VARCHAR(255);
`;
db.query(alterColumnsSQL, (err, result) => {
  if (err) {
    console.error("Error altering columns:", err);
  } else {
    console.log("Columns altered successfully:", result);
  }
});
app.delete("/certificate/:id", vuser, isAdmin, (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM certificates WHERE id = ?";
  db.query(sql, userId, (err, result) => {
    if (err) return res.json(err);
    return res.json({
      message: "Certif deleted successfully",
      affectedRows: result.affectedRows,
    });
  });
});

// ---------------------------- Patient ----------------------------------------------------
app.get("/patient", vuser, (req, res) => {
  const sql = "SELECT * FROM patients";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/patient/:id", vuser, (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM patients WHERE id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }
    return res.json(data[0]);
  });
});
app.post("/patient", vuser, (req, res) => {
  const { nom, prenom, adress, cin, ppr, phone } = req.body;

  const checkPatientQuery = `
    SELECT * FROM patients WHERE nom = ? AND prenom = ?
  `;
  db.query(checkPatientQuery, [nom, prenom], (err, rows) => {
    if (err) {
      console.error("Error checking Patient name:", err);
      return res.json({ error: "Error checking Patient name" });
    }
    if (rows.length > 0) {
      return res.json({ error: "Patient already exists" });
    } else {
      const insertPatientQuery = `
        INSERT INTO patients (nom, prenom, adress, cin, ppr, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [nom, prenom, adress, cin, ppr, phone];
      db.query(insertPatientQuery, values, (err, result) => {
        if (err) {
          console.error("Error adding Patient:", err);
          return res.json({ error: "Error adding Patient" });
        }
        console.log("Patient added successfully");
        return res.json({ message: "Patient added successfully" });
      });
    }
  });
});
app.post("/patients", vuser, (req, res) => {
  const { nom, prenom, address, cin, ppr, phone } = req.body;
  const checkUsernameQuery = `
    SELECT * FROM patients WHERE nom = ? AND prenom = ?
  `;
  db.query(checkUsernameQuery, [nom, prenom], (err, rows) => {
    if (err) {
      console.error("Error checking patients:", err);
      return res.json({ error: "Error checking patients 1" });
    }
    if (rows.length > 0) {
      return res.json({ error: "Patient already exists" });
    } else {
      const insertUserQuery = `
        INSERT INTO patients (nom, prenom, address, cin, ppr, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [nom, prenom, address, cin, ppr, phone];
      db.query(insertUserQuery, values, (err, result) => {
        if (err) {
          console.error("Error adding Patient 4:", err);
          return res.json({ error: "Error adding Patient 5" });
        }
        console.log("Patient added successfully");
        return res.json({ message: "Patient added successfully" });
      });
    }
  });
});
app.put("/patients/:id", vuser, (req, res) => {
  const { id } = req.params;
  const { nom, prenom, address, cin, ppr, phone } = req.body;
  db.query(
    "SELECT * FROM patients WHERE cin = ? AND id != ?",
    [cin, id],
    (err, rows) => {
      if (err) {
        console.error("Error checking cin:", err);
        return res.status(500).json({ error: "Error checking cin" });
      }
      if (rows.length > 0) {
        return res.status(400).json({ error: "cin already exists" });
      }
      const sql = `
        UPDATE patients 
        SET 
          nom = ?,
          prenom = ?,
          address = ?,
          cin = ?,
          ppr = ?,
          phone = ?
        WHERE id = ?
      `;
      const values = [nom, prenom, address, cin, ppr, phone, id];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error updating patient:", err);
          return res.status(500).json({ error: "Error updating patient" });
        }
        console.log("Patient updated successfully");
        return res.json({ message: "Patient updated successfully" });
      });
    }
  );
});
app.delete("/patients/:id", vuser, isAdmin, (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM patients WHERE id = ?";
  db.query(sql, userId, (err, result) => {
    if (err) return res.json(err);
    return res.json({
      message: "Patient deleted successfully",
      affectedRows: result.affectedRows,
    });
  });
});

// ---------------------------- Patient ----------------------------------------------------
app.get("/spds", vuser, (req, res) => {
  const sql = "SELECT * FROM spds";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/mts", vuser, (req, res) => {
  const sql = "SELECT * FROM mts";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/provs", vuser, (req, res) => {
  const sql = "SELECT * FROM provs";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.post("/spds", vuser, (req, res) => {
  const { spd } = req.body;
  const sql = "INSERT INTO spds (spd) VALUES (?)";
  db.query(sql, [spd], (err, result) => {
    if (err) {
      console.error("Error adding spd:", err);
      return res.status(500).json({ error: "Error adding spd" });
    }
    res
      .status(201)
      .json({ message: "SPD added successfully", id: result.insertId });
  });
});
app.post("/mts", vuser, (req, res) => {
  const { mt } = req.body;
  const sql = "INSERT INTO mts (mt) VALUES (?)";
  db.query(sql, [mt], (err, result) => {
    if (err) {
      console.error("Error adding mt:", err);
      return res.status(500).json({ error: "Error adding mt" });
    }
    res
      .status(201)
      .json({ message: "MT added successfully", id: result.insertId });
  });
});
app.post("/provs", vuser, (req, res) => {
  const { prov } = req.body;
  const sql = "INSERT INTO provs (prov) VALUES (?)";
  db.query(sql, [prov], (err, result) => {
    if (err) {
      console.error("Error adding prov:", err);
      return res.status(500).json({ error: "Error adding prov" });
    }
    res
      .status(201)
      .json({ message: "Prov added successfully", id: result.insertId });
  });
});

// ---------------------------- Users ----------------------------------------------------
app.get("/users", vuser, isAdmin, (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.post("/users", vuser, isAdmin, (req, res) => {
  const { username, nom, prenom, password } = req.body;
  const checkUsernameQuery = `
    SELECT * FROM users WHERE username = ?
  `;
  db.query(checkUsernameQuery, [username], (err, rows) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.json({ error: "Error checking username" });
    }
    if (rows.length > 0) {
      return res.json({ error: "Username already exists" });
    } else {
      const insertUserQuery = `
        INSERT INTO users (username, nom, prenom, password)
        VALUES (?, ?, ?, ?)
      `;
      const values = [username, nom, prenom, password];
      db.query(insertUserQuery, values, (err, result) => {
        if (err) {
          console.error("Error adding user:", err);
          return res.json({ error: "Error adding user" });
        }
        console.log("User added successfully");
        return res.json({ message: "User added successfully" });
      });
    }
  });
});
app.put("/users/:id", vuser, isAdmin, (req, res) => {
  const { id } = req.params;
  const { nom, prenom, username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND id != ?",
    [username, id],
    (err, rows) => {
      if (err) {
        console.error("Error checking username:", err);
        return res.status(500).json({ error: "Error checking username" });
      }

      if (rows.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (rows.length === 0) {
        const sql = `
        UPDATE users 
        SET 
          nom = ?,
          prenom = ?,
          username = ?,
          password = ?
        WHERE id = ?
      `;
        const values = [nom, prenom, username, password, id];

        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ error: "Error updating user" });
          }
          console.log("User updated successfully");
          return res.json({ message: "User updated successfully" });
        });
      }
    }
  );
});
app.delete("/users/:id", vuser, isAdmin, (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, userId, (err, result) => {
    if (err) return res.json(err);
    return res.json({
      message: "User deleted successfully",
      affectedRows: result.affectedRows,
    });
  });
});
app.post("/users/login", (req, res) => {
  const sql = `
    SELECT *
    FROM users
    WHERE username = ?
  `;
  db.query(sql, [req.body.username], (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ Error: "Internal server error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ Error: "User not found" });
    }
    const user = result[0];
    if (req.body.password === user.password) {
      const name = user.prenom + " - " + user.nom;
      const admin = user.admin;
      const id = user.id;
      const token = jwt.sign({ name, admin, id }, "jwt-secret-key", {
        expiresIn: "30d",
      });
      res.cookie("token", token);
      return res.status(200).json({ login: true, user });
    } else {
      return res.status(401).json({ Error: "Wrong password" });
    }
  });
});
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

app.listen(8081, "0.0.0.0", () => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) return console.log("Cannot connect to Database...");
    return console.log("Server is Working...");
  });
});
