import ExcelJS from "exceljs";

const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Certificates");

  worksheet.columns = [
    { header: "N°", key: "id", width: 10 },
    { header: "Nom & Prenom", key: "nom_prenom", width: 20 },
    { header: "Date", key: "date_depot", width: 15 },
    { header: "CIN / PPR", key: "cin_ppr", width: 20 },
    { header: "Durée", key: "duration", width: 10 },
    { header: "Du", key: "date_debut", width: 15 },
    { header: "Au", key: "date_fin", width: 15 },
    {
      header: "Specialite medecin debut",
      key: "specialite_medecin",
      width: 25,
    },
    { header: "Médecin traitant", key: "medecin_traitant", width: 25 },
    { header: "Resultat de la commission", key: "resultat", width: 20 },
    { header: "Type", key: "type_conge", width: 20 },
    { header: "Administration", key: "administration", width: 20 },
    { header: "Hors province", key: "hors_province", width: 15 },
  ];

  // Add data rows
  data.forEach((m) => {
    // Set default values based on the algorithm
    const contreVisitNull = m.contre_visit === 0;
    const faitNull = m.fait === 0;

    worksheet.addRow({
      id: m.id,
      nom_prenom: `${m.patient_nom} ${m.patient_prenom}`,
      date_depot: formatDate(m.date_depot),
      cin_ppr: m.patient_ppr || m.patient_cin,
      duration: m.duration,
      date_debut: formatDate(m.date_debut),
      date_fin: formatDate(m.date_fin),
      specialite_medecin: contreVisitNull ? "- - -" : m.spd || "- - -",
      medecin_traitant: contreVisitNull ? "- - -" : m.mt || "- - -",
      resultat: contreVisitNull
        ? "- - -"
        : m.resultat === 1
        ? "Justifié"
        : m.resultat === 0
        ? "Non Justifié"
        : m.resultat === 2
        ? "Ne s'est Présenté"
        : m.resultat === 3
        ? "Hors délai"
        : "?",
      type_conge: contreVisitNull
        ? "- - -"
        : m.type_conge === 1
        ? "Courte Durée"
        : m.type_conge === 2
        ? "Durée Intermédiaire"
        : m.type_conge === 3
        ? "Longue Durée"
        : m.type_conge === 4
        ? "Accident de travail"
        : m.type_conge === 5
        ? "Dérogation"
        : "- - -",
      administration: contreVisitNull ? "- - -" : m.patient_address,
      hors_province: faitNull ? "- - -" : m.prov || "-", // Updated to include 'prov' data
    });

    // Set null values based on conditions
    if (contreVisitNull) {
      worksheet.getCell(`H${worksheet.lastRow.number}`).value = "- - -"; // Set resultat to "- - -"
      worksheet.getCell(`K${worksheet.lastRow.number}`).value = "- - -"; // Set type_conge to "- - -"
      worksheet.getCell(`L${worksheet.lastRow.number}`).value = "- - -"; // Set administration to "- - -"
      worksheet.getCell(`M${worksheet.lastRow.number}`).value = "- - -"; // Set hors_province to "- - -"
      worksheet.getCell(`G${worksheet.lastRow.number}`).value = "- - -"; // Set date_cv to "- - -"
      worksheet.getCell(`D${worksheet.lastRow.number}`).value = "- - -"; // Set mts to "- - -"
      worksheet.getCell(`I${worksheet.lastRow.number}`).value = "- - -"; // Set explication to "- - -"
    }

    // If fait is 0, also set the corresponding fields to "- - -"
    if (faitNull) {
      worksheet.getCell(`L${worksheet.lastRow.number}`).value = "- - -"; // Set hors_province to "- - -"
    }
  });

  // Center align all cells and set wrap text
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" }; // Center align
      cell.alignment.wrapText = true; // Enable text wrapping
    });

    // Set row height (x2)
    row.height = 30; // Adjust height as needed, default is usually around 15
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Create a blob from the buffer
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create a link element and trigger the download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "certificates.xlsx";
  link.click();
};

// Date formatting function
function formatDate(dt) {
  const date = new Date(dt);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default exportToExcel;
