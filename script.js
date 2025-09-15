// Données de l'application
let merchandiseData = JSON.parse(localStorage.getItem('merchandiseData')) || [];
let achatData = JSON.parse(localStorage.getItem('achatData')) || [];
let productionData = JSON.parse(localStorage.getItem('productionData')) || [];
let venteData = JSON.parse(localStorage.getItem('venteData')) || [];
let totalAchats = 0;
let totalVentes = 0;
let totalProduction = 0;
let totalBenefice = 0;

// Compteurs pour les numéros de rapport
let achatCounter = localStorage.getItem('achatCounter') || 0;
let productionCounter = localStorage.getItem('productionCounter') || 0;
let venteCounter = localStorage.getItem('venteCounter') || 0;

// Références DOM
const sections = document.querySelectorAll('.app-section');
const navLinks = document.querySelectorAll('.sidebar ul li a');
const notificationArea = document.getElementById('notification-area');
const currentDateTimeElem = document.getElementById('currentDateTime');
const technicianNameInput = document.getElementById('technicianNameInput');

// Éléments du tableau de bord
const totalAchatsCountElem = document.getElementById('totalAchatsCount');
const totalProductionCountElem = document.getElementById('totalProductionCount');
const totalVentesCountElem = document.getElementById('totalVentesCount');
const totalBeneficeCountElem = document.getElementById('totalBeneficeCount');

// Sélecteurs de marchandise
const achatMarchandiseSelect = document.getElementById('achatMarchandise');
const productionMarchandiseSelect = document.getElementById('productionMarchandise');
const venteMarchandiseSelect = document.getElementById('venteMarchandise');
const bilanTypeMarchandiseSelect = document.getElementById('bilanTypeMarchandise');

// Graphiques
let achatVenteChart, repartitionAchatsChart, productionChart;

// --- Fonctions utilitaires ---
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active-section');
    }
}

function updateActiveLink(sectionId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section-id') === sectionId) {
            link.classList.add('active');
        }
    });
}

function showNotification(message, type) {
    notificationArea.textContent = message;
    notificationArea.className = `notification-area ${type}`;
    notificationArea.style.display = 'block';
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 5000);
}

function updateDateTime() {
    const now = new Date();
    currentDateTimeElem.textContent = now.toLocaleString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

function saveToLocalStorage() {
    localStorage.setItem('merchandiseData', JSON.stringify(merchandiseData));
    localStorage.setItem('achatData', JSON.stringify(achatData));
    localStorage.setItem('productionData', JSON.stringify(productionData));
    localStorage.setItem('venteData', JSON.stringify(venteData));
    localStorage.setItem('achatCounter', achatCounter);
    localStorage.setItem('productionCounter', productionCounter);
    localStorage.setItem('venteCounter', venteCounter);
}

// --- Fonctions de rendu et de mise à jour ---
function updateDashboard() {
    totalAchats = achatData.reduce((sum, item) => sum + item.montant, 0);
    totalProduction = productionData.reduce((sum, item) => sum + item.quantite, 0);
    totalVentes = venteData.reduce((sum, item) => sum + item.montant, 0);
    totalBenefice = totalVentes - totalAchats;

    totalAchatsCountElem.textContent = `${formatNumber(totalAchats)} CFA`;
    totalProductionCountElem.textContent = `${formatNumber(totalProduction)}`;
    totalVentesCountElem.textContent = `${formatNumber(totalVentes)} CFA`;
    totalBeneficeCountElem.textContent = `${formatNumber(totalBenefice)} CFA`;
}

function updateMerchandiseSelects() {
    const selects = [achatMarchandiseSelect, productionMarchandiseSelect, venteMarchandiseSelect, bilanTypeMarchandiseSelect];
    
    // Conserver l'option "Sélectionner une marchandise" et les autres options existantes
    selects.forEach(select => {
        const selectedValue = select.value;
        const options = Array.from(select.options).filter(opt => opt.value === "");
        select.innerHTML = '';
        options.forEach(opt => select.add(opt));

        merchandiseData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nom;
            option.textContent = item.nom;
            select.appendChild(option);
        });

        // Rétablir la sélection précédente
        select.value = selectedValue;
    });
}

function renderTable(data, tableId) {
    const tableBody = document.getElementById(tableId).querySelector('tbody');
    tableBody.innerHTML = '';
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        if (tableId === 'tableAchat') {
            row.innerHTML = `
                <td>${item.numeroRapport}</td>
                <td>${item.marchandise}</td>
                <td>${formatNumber(item.quantite)}</td>
                <td>${formatNumber(item.montant)} CFA</td>
                <td>${item.date}</td>
                <td class="action-buttons">
                    <button class="edit-button" onclick="editEntry(${index}, '${tableId}')" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="delete-button" onclick="deleteEntry(${index}, '${tableId}')" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        } else if (tableId === 'tableProduction') {
            row.innerHTML = `
                <td>${item.numeroRapport}</td>
                <td>${item.marchandise}</td>
                <td>${item.date}</td>
                <td>${formatNumber(item.quantite)}</td>
                <td>${formatNumber(item.prixUnitaire)} CFA</td>
                <td>${formatNumber(item.montant)} CFA</td>
                <td class="action-buttons">
                    <button class="edit-button" onclick="editEntry(${index}, '${tableId}')" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="delete-button" onclick="deleteEntry(${index}, '${tableId}')" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        } else if (tableId === 'tableVente') {
             row.innerHTML = `
                <td>${item.numeroRapport}</td>
                <td>${item.marchandise}</td>
                <td>${item.date}</td>
                <td>${formatNumber(item.quantite)}</td>
                <td>${formatNumber(item.prixUnitaire)} CFA</td>
                <td>${formatNumber(item.montant)} CFA</td>
                <td class="action-buttons">
                    <button class="edit-button" onclick="editEntry(${index}, '${tableId}')" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="delete-button" onclick="deleteEntry(${index}, '${tableId}')" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        } else if (tableId === 'tableMarchandise') {
             row.innerHTML = `
                <td>${item.nom}</td>
                <td>${item.date}</td>
                <td>${item.fournisseur}</td>
                <td>${item.tel}</td>
                <td>${item.type}</td>
                <td class="action-buttons">
                    <button class="edit-button" onclick="editEntry(${index}, '${tableId}')" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="delete-button" onclick="deleteEntry(${index}, '${tableId}')" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

function updateAll() {
    updateDateTime();
    updateDashboard();
    updateMerchandiseSelects();
    renderTable(achatData, 'tableAchat');
    renderTable(productionData, 'tableProduction');
    renderTable(venteData, 'tableVente');
    renderTable(merchandiseData, 'tableMarchandise');
    updateCharts();
}

// --- Fonctions de gestion de données (CRUD) ---

// Fonctions génériques d'ajout
function addData(formId, dataArray, counterKey, tableName) {
    const form = document.getElementById(formId);
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const technicianName = technicianNameInput.value.trim();
        if (!technicianName) {
            showNotification('Veuillez entrer le nom du technicien.', 'error');
            return;
        }

        const formData = new FormData(form);
        const newData = {};

        if (formId === 'formAchat') {
            const marchandise = form.querySelector('#achatMarchandise').value;
            const quantite = parseFloat(form.querySelector('#achatQuantite').value);
            const montant = parseFloat(form.querySelector('#achatMontant').value);
            const date = form.querySelector('#achatDate').value;
            if (isNaN(quantite) || isNaN(montant) || quantite < 0 || montant < 0) {
                 showNotification('Veuillez entrer des valeurs numériques positives pour la quantité et le montant.', 'error');
                return;
            }
            achatCounter++;
            newData.numeroRapport = `ACH-${achatCounter}`;
            newData.marchandise = marchandise;
            newData.quantite = quantite;
            newData.montant = montant;
            newData.date = date;
            newData.technicien = technicianName;
            dataArray.push(newData);
            localStorage.setItem(counterKey, achatCounter);
            showNotification('Achat enregistré avec succès !', 'success');
        } else if (formId === 'formProduction') {
            const marchandise = form.querySelector('#productionMarchandise').value;
            const date = form.querySelector('#productionDate').value;
            const quantite = parseFloat(form.querySelector('#productionQuantite').value);
            const prixUnitaire = parseFloat(form.querySelector('#productionPrixUnitaire').value);
            if (isNaN(quantite) || isNaN(prixUnitaire) || quantite < 0 || prixUnitaire < 0) {
                 showNotification('Veuillez entrer des valeurs numériques positives pour la quantité et le prix unitaire.', 'error');
                return;
            }
            productionCounter++;
            newData.numeroRapport = `PRO-${productionCounter}`;
            newData.marchandise = marchandise;
            newData.date = date;
            newData.quantite = quantite;
            newData.prixUnitaire = prixUnitaire;
            newData.montant = quantite * prixUnitaire;
            newData.technicien = technicianName;
            dataArray.push(newData);
            localStorage.setItem(counterKey, productionCounter);
            showNotification('Production enregistrée avec succès !', 'success');
        } else if (formId === 'formVente') {
            const marchandise = form.querySelector('#venteMarchandise').value;
            const date = form.querySelector('#venteDate').value;
            const quantite = parseFloat(form.querySelector('#venteQuantite').value);
            const prixUnitaire = parseFloat(form.querySelector('#ventePrixUnitaire').value);
             if (isNaN(quantite) || isNaN(prixUnitaire) || quantite < 0 || prixUnitaire < 0) {
                 showNotification('Veuillez entrer des valeurs numériques positives pour la quantité et le prix unitaire.', 'error');
                return;
            }
            venteCounter++;
            newData.numeroRapport = `VEN-${venteCounter}`;
            newData.marchandise = marchandise;
            newData.date = date;
            newData.quantite = quantite;
            newData.prixUnitaire = prixUnitaire;
            newData.montant = quantite * prixUnitaire;
            newData.technicien = technicianName;
            dataArray.push(newData);
            localStorage.setItem(counterKey, venteCounter);
            showNotification('Vente enregistrée avec succès !', 'success');
        } else if (formId === 'formMarchandise') {
            const nom = form.querySelector('#marchandiseNom').value;
            const date = form.querySelector('#marchandiseDate').value;
            const fournisseur = form.querySelector('#marchandiseFournisseur').value;
            const tel = form.querySelector('#marchandiseTel').value;
            const type = form.querySelector('#marchandiseType').value;
            
            // Vérifier si la marchandise existe déjà
            const exists = merchandiseData.some(item => item.nom.toLowerCase() === nom.toLowerCase());
            if (exists) {
                showNotification(`La marchandise "${nom}" existe déjà.`, 'error');
                return;
            }
            
            newData.nom = nom;
            newData.date = date;
            newData.fournisseur = fournisseur;
            newData.tel = tel;
            newData.type = type;
            dataArray.push(newData);
            showNotification('Marchandise enregistrée avec succès !', 'success');
        }

        saveToLocalStorage();
        updateAll();
        form.reset();
    });
}

function editEntry(index, tableId) {
    let dataArray;
    let fields = [];

    if (tableId === 'tableAchat') {
        dataArray = achatData;
        fields = ['marchandise', 'quantite', 'montant', 'date'];
    } else if (tableId === 'tableProduction') {
        dataArray = productionData;
        fields = ['marchandise', 'date', 'quantite', 'prixUnitaire'];
    } else if (tableId === 'tableVente') {
        dataArray = venteData;
        fields = ['marchandise', 'date', 'quantite', 'prixUnitaire'];
    } else if (tableId === 'tableMarchandise') {
        dataArray = merchandiseData;
        fields = ['nom', 'date', 'fournisseur', 'tel', 'type'];
    } else {
        return;
    }
    
    const entry = dataArray[index];
    const newValues = {};
    let isModified = false;

    fields.forEach(field => {
        let promptMessage = `Entrez la nouvelle valeur pour "${field}" (actuel : ${entry[field]}) :`;
        if (field === 'marchandise') {
            promptMessage = `Entrez la nouvelle valeur pour le type de marchandise (actuel : ${entry[field]}) :`;
        }
        const newValue = prompt(promptMessage);
        
        if (newValue !== null && newValue.trim() !== '' && newValue !== entry[field].toString()) {
            newValues[field] = isNaN(parseFloat(newValue)) ? newValue.trim() : parseFloat(newValue);
            isModified = true;
        } else {
            newValues[field] = entry[field];
        }
    });

    if (isModified) {
        // Mettre à jour les données
        Object.assign(entry, newValues);
        
        // Recalculer le montant pour la production et la vente
        if (tableId === 'tableProduction' || tableId === 'tableVente') {
            entry.montant = entry.quantite * entry.prixUnitaire;
        }

        saveToLocalStorage();
        updateAll();
        showNotification('Entrée modifiée avec succès.', 'success');
    } else {
        showNotification('Aucune modification apportée.', 'info');
    }
}

function deleteEntry(index, tableId) {
    let dataArray;
    if (tableId === 'tableAchat') {
        dataArray = achatData;
    } else if (tableId === 'tableProduction') {
        dataArray = productionData;
    } else if (tableId === 'tableVente') {
        dataArray = venteData;
    } else if (tableId === 'tableMarchandise') {
        dataArray = merchandiseData;
    } else {
        return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
        dataArray.splice(index, 1);
        saveToLocalStorage();
        updateAll();
        showNotification('Entrée supprimée avec succès.', 'success');
    }
}


// --- Fonctions de bilans et de graphiques ---
function generateBilan() {
    const mois = document.getElementById('bilanMois').value;
    const annee = document.getElementById('bilanAnnee').value;
    const marchandise = document.getElementById('bilanTypeMarchandise').value;
    const technicien = technicianNameInput.value.trim();

    if (!mois || !annee || !marchandise || !technicien) {
        showNotification('Veuillez remplir tous les champs du formulaire de bilan.', 'error');
        return;
    }

    const filteredAchats = achatData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() == annee && itemDate.getMonth() == getMonthIndex(mois) && item.marchandise === marchandise;
    });

    const filteredVentes = venteData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() == annee && itemDate.getMonth() == getMonthIndex(mois) && item.marchandise === marchandise;
    });

    const filteredProduction = productionData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() == annee && itemDate.getMonth() == getMonthIndex(mois) && item.marchandise === marchandise;
    });

    const totalAchatsBilan = filteredAchats.reduce((sum, item) => sum + item.montant, 0);
    const quantiteAcheteeBilan = filteredAchats.reduce((sum, item) => sum + item.quantite, 0);
    const totalVentesBilan = filteredVentes.reduce((sum, item) => sum + item.montant, 0);
    const quantiteVendueBilan = filteredVentes.reduce((sum, item) => sum + item.quantite, 0);
    const totalProductionBilan = filteredProduction.reduce((sum, item) => sum + item.quantite, 0);
    const beneficeReelBilan = totalVentesBilan - totalAchatsBilan;

    document.getElementById('bilanMoisAnnee').textContent = `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`;
    document.getElementById('bilanDateHeure').textContent = new Date().toLocaleString('fr-FR');
    document.getElementById('bilanTechnicien').textContent = technicien;
    document.getElementById('totalVentesBilan').textContent = `${formatNumber(totalVentesBilan)} CFA`;
    document.getElementById('totalAchatsBilan').textContent = `${formatNumber(totalAchatsBilan)} CFA`;
    document.getElementById('beneficeReelBilan').textContent = `${formatNumber(beneficeReelBilan)} CFA`;
    document.getElementById('totalProductionBilan').textContent = formatNumber(totalProductionBilan);
    document.getElementById('quantiteAcheteeBilan').textContent = formatNumber(quantiteAcheteeBilan);
    document.getElementById('quantiteVendueBilan').textContent = formatNumber(quantiteVendueBilan);

    document.getElementById('bilanResultats').style.display = 'block';
}

function getMonthIndex(monthName) {
    const months = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
    return months.indexOf(monthName.toLowerCase());
}

function printBilan() {
    const bilanSection = document.getElementById('bilanResultats');
    if (bilanSection.style.display === 'none') {
        showNotification('Veuillez générer un bilan avant de l\'imprimer.', 'error');
        return;
    }

    const originalContents = document.body.innerHTML;
    const printContents = bilanSection.innerHTML;

    document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://via.placeholder.com/60/FFD700/000000?text=G" alt="Logo de GaliBusiness" style="width: 60px;">
                <h1 style="color: #004d40;">Rapport de Bilan GaliBusiness</h1>
                <p>Généré par GaliBusiness</p>
            </div>
            ${printContents}
            <div style="text-align: right; margin-top: 30px; font-size: 0.9em; border-top: 1px solid #ccc; padding-top: 10px;">
                <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
            </div>
        </div>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Recharger la page pour restaurer les listeners
}

function updateCharts() {
    // Détruire les graphiques existants pour éviter les superpositions
    if (achatVenteChart) achatVenteChart.destroy();
    if (repartitionAchatsChart) repartitionAchatsChart.destroy();
    if (productionChart) productionChart.destroy();

    // Données pour les graphiques
    const monthlyData = aggregateMonthlyData();
    const purchaseBreakdown = getPurchaseBreakdown();

    // Graphique Achats/Ventes
    const ctxAchatVente = document.getElementById('achatVenteChart').getContext('2d');
    achatVenteChart = new Chart(ctxAchatVente, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Achats (CFA)',
                data: monthlyData.achatTotals,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                tension: 0.4,
            }, {
                label: 'Ventes (CFA)',
                data: monthlyData.venteTotals,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Graphique Répartition des Achats
    const ctxRepartitionAchats = document.getElementById('repartitionAchatsChart').getContext('2d');
    const colors = generateColors(purchaseBreakdown.labels.length);
    repartitionAchatsChart = new Chart(ctxRepartitionAchats, {
        type: 'doughnut',
        data: {
            labels: purchaseBreakdown.labels,
            datasets: [{
                label: 'Répartition des Achats',
                data: purchaseBreakdown.data,
                backgroundColor: colors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
        }
    });
    
    // Graphique Productivité par Mois
    const ctxProduction = document.getElementById('productionChart').getContext('2d');
    productionChart = new Chart(ctxProduction, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Quantité Produite',
                data: monthlyData.productionTotals,
                backgroundColor: '#004d40',
                borderColor: '#004d40',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function aggregateMonthlyData() {
    const monthlyTotals = {};
    const today = new Date();
    const currentYear = today.getFullYear();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    for (let i = 0; i < 12; i++) {
        const monthName = months[i];
        monthlyTotals[monthName] = { achat: 0, vente: 0, production: 0 };
    }

    achatData.forEach(item => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear) {
            const monthName = months[date.getMonth()];
            monthlyTotals[monthName].achat += item.montant;
        }
    });

    venteData.forEach(item => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear) {
            const monthName = months[date.getMonth()];
            monthlyTotals[monthName].vente += item.montant;
        }
    });
    
    productionData.forEach(item => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear) {
            const monthName = months[date.getMonth()];
            monthlyTotals[monthName].production += item.quantite;
        }
    });

    const labels = Object.keys(monthlyTotals);
    const achatTotals = labels.map(label => monthlyTotals[label].achat);
    const venteTotals = labels.map(label => monthlyTotals[label].vente);
    const productionTotals = labels.map(label => monthlyTotals[label].production);

    return { labels, achatTotals, venteTotals, productionTotals };
}

function getPurchaseBreakdown() {
    const breakdown = {};
    achatData.forEach(item => {
        const key = item.marchandise;
        if (!breakdown[key]) {
            breakdown[key] = 0;
        }
        breakdown[key] += item.montant;
    });
    return {
        labels: Object.keys(breakdown),
        data: Object.values(breakdown)
    };
}

function generateColors(num) {
    const colors = [];
    const baseColors = ['#004d40', '#80cbc4', '#ffb300', '#4caf50', '#f44336', '#2196f3', '#9c27b0', '#ffeb3b', '#607d8b'];
    for (let i = 0; i < num; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

// --- Initialisation et Événements ---
document.addEventListener('DOMContentLoaded', () => {
    updateAll();
    setInterval(updateDateTime, 1000);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section-id');
            showSection(sectionId);
            updateActiveLink(sectionId);
            if (sectionId === 'charts-section') {
                updateCharts();
            }
        });
    });

    // Gestion des formulaires
    addData('formMarchandise', merchandiseData);
    addData('formAchat', achatData);
    addData('formProduction', productionData);
    addData('formVente', venteData);
    
    // Calcul automatique du montant de production et vente
    const productionQuantite = document.getElementById('productionQuantite');
    const productionPrixUnitaire = document.getElementById('productionPrixUnitaire');
    const productionMontant = document.getElementById('productionMontant');
    
    [productionQuantite, productionPrixUnitaire].forEach(input => {
        input.addEventListener('input', () => {
            const quantite = parseFloat(productionQuantite.value) || 0;
            const prix = parseFloat(productionPrixUnitaire.value) || 0;
            productionMontant.value = formatNumber(quantite * prix) + ' CFA';
        });
    });
    
    const venteQuantite = document.getElementById('venteQuantite');
    const ventePrixUnitaire = document.getElementById('ventePrixUnitaire');
    const venteMontant = document.getElementById('venteMontant');
    
    [venteQuantite, ventePrixUnitaire].forEach(input => {
        input.addEventListener('input', () => {
            const quantite = parseFloat(venteQuantite.value) || 0;
            const prix = parseFloat(ventePrixUnitaire.value) || 0;
            venteMontant.value = formatNumber(quantite * prix) + ' CFA';
        });
    });

    // Bouton de génération de bilan
    document.getElementById('formBilan').addEventListener('submit', (e) => {
        e.preventDefault();
        generateBilan();
    });

    // Bouton d'impression de bilan
    document.getElementById('btnPrintBilan').addEventListener('click', printBilan);
    
    // Boutons d'impression des tables
    document.querySelectorAll('.print-button[data-table-id]').forEach(button => {
        button.addEventListener('click', (e) => {
            const tableId = e.currentTarget.getAttribute('data-table-id');
            const table = document.getElementById(tableId);
            const tableHeader = table.querySelector('caption').textContent;
            
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Imprimer le Rapport</title>');
            printWindow.document.write('<style>@media print { body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ccc; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } h1, h3 { text-align: center; color: #004d40; } .header-print { text-align: center; margin-bottom: 20px; } .header-print img { width: 50px; } }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="header-print">');
            printWindow.document.write('<img src="https://via.placeholder.com/50/FFD700/000000?text=G" alt="Logo">');
            printWindow.document.write('<h1>Rapport GaliBusiness</h1>');
            printWindow.document.write('<h3>' + tableHeader + '</h3>');
            printWindow.document.write('</div>');
            printWindow.document.write(table.outerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        });
    });
});




//CODE DE PROTECTION



// Définis le mot de passe requis
const motDePasseRequis = '00S1';

// Demande à l'utilisateur d'entrer le mot de passe
let motDePasseSaisi = prompt('Veuillez entrer le mot de passe pour accéder à l\'application.');

// Vérifie si le mot de passe saisi est correct
if (motDePasseSaisi === motDePasseRequis) {
  // Le mot de passe est correct, tu peux continuer
  alert('Accès accordé !');
  // Ici, tu peux mettre tout le code de ton application
  // Par exemple, afficher le contenu de la page
} else {
  // Le mot de passe est incorrect
  alert('Mot de passe incorrect. Accès refusé !');
  // Tu peux rediriger l'utilisateur ou cacher le contenu
  window.location.href = ''; // Exemple de redirection
}
