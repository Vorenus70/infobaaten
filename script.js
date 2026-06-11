const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMyb0TYfW0pFQukBpPFODUy3U2S2CuhjGwD4Ix4vZYfnYOVldsEXjIPrYTUk3oJtBkcgWzxYB-YVpf/pub?gid=0&single=true&output=csv';

const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 
                    'juli', 'august', 'september', 'oktober', 'november', 'desember'];

let allRows = [];
let chartInstance = null;   
let isMobile = false;
let selectedYear = 'all';
let selectedMonth = 'all';

// Detect mobile device
function checkMobile() {
    isMobile = window.innerWidth <= 768;
}

function getDateObject(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
}

function getYear(dateStr) {
    const parts = dateStr.split('-');
    return parts.length === 3 ? parseInt(parts[2], 10) : null;
}

function getMonth(dateStr) {
    const parts = dateStr.split('-');
    return parts.length === 3 ? parseInt(parts[1], 10) : null;
}

function formatDateForChart(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    if (isMobile) {
        return `${parts[0]}/${parts[1]}`;
    }
    return `${parts[0]}.${parts[1]}`;
}

function formatTimestamp(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "Oppdatert: --:--";
    
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return `Oppdatert: ${timeStr.substring(0, 5)}`;
    
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2].slice(-2);
    const time = timeStr.substring(0, 5);
    
    return `Oppdatert: ${day}.${month}.${year} - ${time}`;
}

function calculateTrendLine(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((_, i) => slope * i + intercept);
}

function calculateAverage(data) {
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
}

function addDivider(tbody, month, year) {
    const dividerRow = document.createElement("tr");
    dividerRow.className = "month-divider";
    const dividerCell = document.createElement("td");
    dividerCell.colSpan = 5;
    dividerCell.textContent = `--- ${monthNames[month - 1]} ${year} ---`;
    dividerRow.appendChild(dividerCell);
    tbody.appendChild(dividerRow);
}

function renderTable() {
    const tbody = document.querySelector("#waterTable tbody");
    tbody.innerHTML = "";
    
    let filteredRows = allRows;
    
    if (selectedYear !== 'all') {
        filteredRows = filteredRows.filter(row => getYear(row.Date) === parseInt(selectedYear, 10));
    }
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
        filteredRows = filteredRows.filter(row => getMonth(row.Date) === parseInt(selectedMonth, 10));
    }
    
    if (filteredRows.length === 0) {
        const tr = document.createElement("tr");
        let message = "Ingen data";
        if (selectedYear !== 'all' && selectedMonth !== 'all') {
            message = `Ingen data for ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;
        } else if (selectedYear !== 'all') {
            message = `Ingen data for ${selectedYear}`;
        }
        tr.innerHTML = `<td colspan="5" style="text-align: center;">${message}</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
        filteredRows.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="hide-on-mobile">${row.Timestamp || ''}</td>
                <td style="white-space: nowrap;">${row.Date || ''}</td>
                <td>${row["Water Level (moh)"] || ''}</td>
                <td>${row["Change vs yesterday"] || ''}</td>
                <td>${row["Change cm/m"] || ''}</td>
            `;
            tbody.appendChild(tr);
        });
        return;
    }
    
    const grouped = {};
    filteredRows.forEach(row => {
        const date = getDateObject(row.Date);
        if (!date) return;
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
    });
    
    const sortedMonths = Object.keys(grouped).sort((a, b) => {
        const [yearA, monthA] = a.split('-');
        const [yearB, monthB] = b.split('-');
        if (yearA !== yearB) return parseInt(yearB, 10) - parseInt(yearA, 10);
        return parseInt(monthB, 10) - parseInt(monthA, 10);
    });
    
    sortedMonths.forEach(monthKey => {
        const [year, month] = monthKey.split('-');
        addDivider(tbody, parseInt(month, 10), parseInt(year, 10));
        grouped[monthKey].forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="hide-on-mobile">${row.Timestamp || ''}</td>
                <td style="white-space: nowrap;">${row.Date || ''}</td>
                <td>${row["Water Level (moh)"] || ''}</td>
                <td>${row["Change vs yesterday"] || ''}</td>
                <td>${row["Change cm/m"] || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function populateYearOptions() {
    const years = new Set();
    allRows.forEach(row => {
        const year = getYear(row.Date);
        if (year) years.add(year);
    });
    const currentYear = new Date().getFullYear();
    const select = document.getElementById('yearSelect');
    while (select.options.length > 1) select.remove(1);
    Array.from(years).sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    });
    if (years.has(currentYear)) {
        select.value = currentYear;
    } else {
        select.value = 'all';
    }
    selectedYear = select.value;
}

function populateMonthOptions() {
    const monthSelect = document.getElementById('monthSelect');
    const monthLabel = document.getElementById('monthLabel');
    const monthOptions = monthSelect.querySelectorAll('option');
    
    monthSelect.value = 'all';
    selectedMonth = 'all';
    
    if (selectedYear === 'all') {
        monthSelect.style.display = 'none';
        if (monthLabel) monthLabel.style.display = 'none';
        return;
    }
    
    const availableMonths = new Set();
    allRows.forEach(row => {
        if (getYear(row.Date) === parseInt(selectedYear, 10)) {
            const month = getMonth(row.Date);
            if (month) availableMonths.add(month);
        }
    });
    
    for (let i = 1; i < monthOptions.length; i++) {
        const option = monthOptions[i];
        const monthValue = parseInt(option.value, 10);
        if (availableMonths.has(monthValue)) {
            option.disabled = false;
            option.style.opacity = '1';
        } else {
            option.disabled = true;
            option.style.opacity = '0.5';
        }
    }
    
    monthSelect.style.display = 'inline-block';
    if (monthLabel) monthLabel.style.display = 'inline';
}

function updateLatestCard() {
    const latestValueElem = document.getElementById('latestValue');
    const latestUpdatedElem = document.getElementById('latestUpdated');
    const latestChangeElem = document.getElementById('latestChange');
    const changeArrow = document.querySelector('.change-arrow');
    const changeValue = document.querySelector('.change-value');
    
    if (allRows.length === 0) {
        if (latestValueElem) {
            latestValueElem.textContent = "Ingen data";
            latestValueElem.classList.add('no-data');
        }
        if (latestUpdatedElem) latestUpdatedElem.textContent = "Ikke tilgjengelig";
        if (latestChangeElem) {
            if (changeArrow) changeArrow.textContent = '⏳';
            if (changeValue) changeValue.textContent = 'Venter på data';
            latestChangeElem.className = 'latest-change neutral';
        }
        return;
    }
    
    if (latestValueElem) {
        latestValueElem.classList.remove('no-data');
    }
    
    const latest = allRows[0];
    const waterLevel = latest["Water Level (moh)"];
    let changeCm = latest["Change cm/m"];
    
    if (changeCm) {
        changeCm = changeCm.toString().replace(/^'/, '').replace(/^\+/, '');
    }
    
    const isValidWaterLevel = waterLevel && 
                              waterLevel !== "Ikke tilgjengelig" && 
                              waterLevel !== "" &&
                              !isNaN(parseFloat(waterLevel));
    
    if (isValidWaterLevel) {
        if (latestValueElem) latestValueElem.textContent = waterLevel;
        
        if (latestChangeElem && changeCm) {
            let changeNum = parseFloat(changeCm);
            let changeText = changeCm.toString().replace('cm', '').trim();
            
            if (!isNaN(changeNum)) {
                if (changeNum > 0) {
                    if (changeArrow) changeArrow.textContent = '▲';
                    if (changeValue) changeValue.textContent = `${changeText} cm`;
                    latestChangeElem.className = 'latest-change positive';
                } else if (changeNum < 0) {
                    if (changeArrow) changeArrow.textContent = '▼';
                    if (changeValue) changeValue.textContent = `${changeText} cm`;
                    latestChangeElem.className = 'latest-change negative';
                } else {
                    if (changeArrow) changeArrow.textContent = '●';
                    if (changeValue) changeValue.textContent = `${changeText} cm`;
                    latestChangeElem.className = 'latest-change neutral';
                }
            }
        }
    } else {
        if (latestValueElem) {
            latestValueElem.textContent = "Ingen data";
            latestValueElem.classList.add('no-data');
        }
        if (latestChangeElem) {
            if (changeArrow) changeArrow.textContent = '⏳';
            if (changeValue) changeValue.textContent = 'Venter på data';
            latestChangeElem.className = 'latest-change neutral';
        }
    }
    
    if (latestUpdatedElem) {
        const date = latest.Date;
        const time = latest.Timestamp;
        if (date && time) {
            latestUpdatedElem.textContent = formatTimestamp(date, time);
        } else if (time) {
            latestUpdatedElem.textContent = `Oppdatert: ${time.substring(0, 5)}`;
        } else {
            latestUpdatedElem.textContent = `Oppdatert: --:--`;
        }
    }
}

function showToast(message, isError = false) {
    let toast = document.querySelector('.refresh-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'refresh-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#c5221f' : '#0d652d';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalContent = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = `<svg class="action-icon spinning" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
    refreshBtn.disabled = true;
    
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            allRows = results.data.filter(row => row.Date && row["Water Level (moh)"]);
            allRows.sort((a, b) => {
                const dateA = getDateObject(a.Date);
                const dateB = getDateObject(b.Date);
                return dateB - dateA;
            });
            
            const previousYear = selectedYear;
            const previousMonth = selectedMonth;
            
            populateYearOptions();
            
            const yearSelect = document.getElementById('yearSelect');
            if (yearSelect.querySelector(`option[value="${previousYear}"]`)) {
                yearSelect.value = previousYear;
                selectedYear = previousYear;
                populateMonthOptions();
                
                const monthSelect = document.getElementById('monthSelect');
                if (monthSelect.querySelector(`option[value="${previousMonth}"]`) && !monthSelect.querySelector(`option[value="${previousMonth}"]`).disabled) {
                    monthSelect.value = previousMonth;
                    selectedMonth = previousMonth;
                } else {
                    selectedMonth = 'all';
                    monthSelect.value = 'all';
                }
            }
            
            renderTable();
            updateLatestCard();
            
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
            showToast('✓ Data oppdatert');
        },
        error: function() {
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
            showToast('❌ Kunne ikke oppdatere', true);
        }
    });
}

function exportToCSV() {
    let exportRows = allRows;
    
    if (selectedYear !== 'all') {
        exportRows = exportRows.filter(row => getYear(row.Date) === parseInt(selectedYear, 10));
    }
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
        exportRows = exportRows.filter(row => getMonth(row.Date) === parseInt(selectedMonth, 10));
    }
    
    if (exportRows.length === 0) {
        showToast('❌ Ingen data å eksportere', true);
        return;
    }
    
    const headers = ['Tid', 'Dato', 'Vannstand (moh)', 'Endring m', 'Endring cm'];
    const csvRows = [headers];
    
    exportRows.forEach(row => {
        csvRows.push([
            row.Timestamp || '',
            row.Date || '',
            row["Water Level (moh)"] || '',
            row["Change vs yesterday"] || '',
            row["Change cm/m"] || ''
        ]);
    });
    
    const csvContent = csvRows.map(row => row.join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    let fileName = `vannstand_osensjoen_${dateStr}.csv`;
    if (selectedYear !== 'all') {
        fileName = `vannstand_osensjoen_${selectedYear}${selectedMonth !== 'all' ? '_' + monthNames[parseInt(selectedMonth) - 1] : ''}_${dateStr}.csv`;
    }
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`✓ Eksportert ${exportRows.length} rader`);
}

function showGraph() {
    let graphRows = allRows;
    
    if (selectedYear !== 'all') {
        graphRows = graphRows.filter(row => getYear(row.Date) === parseInt(selectedYear, 10));
    }
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
        graphRows = graphRows.filter(row => getMonth(row.Date) === parseInt(selectedMonth, 10));
    }
    
    if (graphRows.length === 0) {
        showToast('❌ Ingen data å vise graf for', true);
        return;
    }
    
    checkMobile();
    
    let displayRows = graphRows;
    if (isMobile && graphRows.length > 15) {
        displayRows = graphRows.filter((_, index) => index % 2 === 0);
        if (displayRows.length < 10) displayRows = graphRows.slice(0, 15);
    }
    displayRows = displayRows.slice(0, isMobile ? 20 : 30);
    
    const labels = [];
    const changeData = [];
    const backgroundColors = [];
    
    [...displayRows].reverse().forEach(row => {
        labels.push(formatDateForChart(row.Date));
        const changeCm = row["Change cm/m"];
        let changeNum = parseFloat(changeCm);
        
        // ZERO-CHANGE FIX: Make zero-change days visible with light gray
        if (isNaN(changeNum)) {
            changeData.push(0);
            backgroundColors.push('#9aa0a6');
        } else if (changeNum === 0) {
            changeData.push(0);
            backgroundColors.push('#dadce0');  // Light gray - visible!
        } else {
            changeData.push(changeNum);
            backgroundColors.push(changeNum > 0 ? '#0d652d' : '#c5221f');
        }
    });
    
    let trendLineData = changeData;
    let averageValue = 0;
    if (changeData.length >= 3) {
        trendLineData = calculateTrendLine(changeData);
        averageValue = calculateAverage(changeData);
    }
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const ctx = document.getElementById('graphCanvas').getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.dataset.label === 'Trendlinje') return null;
                        if (context.dataset.label && context.dataset.label.includes('Gjennomsnitt')) return null;
                        let value = context.raw;
                        if (value > 0) return `Stigning: +${value} cm`;
                        if (value < 0) return `Fall: ${value} cm`;
                        return `Ingen endring: 0 cm`;
                    },
                    bodyFont: { size: isMobile ? 10 : 12 },
                    titleFont: { size: isMobile ? 10 : 12 }
                }
            },
            legend: {
                position: isMobile ? 'bottom' : 'top',
                labels: {
                    boxWidth: isMobile ? 8 : 12,
                    font: { size: isMobile ? 9 : 12 },
                    usePointStyle: true,
                    pointStyle: 'rect'
                }
            }
        },
        scales: {
            y: {
                title: { 
                    display: !isMobile, 
                    text: 'Endring (cm)', 
                    color: '#5f6368' 
                },
                grid: { color: '#e0e5eb' },
                ticks: { 
                    font: { size: isMobile ? 9 : 11 }
                }
            },
            x: {
                title: { 
                    display: !isMobile, 
                    text: 'Dato', 
                    color: '#5f6368' 
                },
                ticks: { 
                    maxRotation: isMobile ? 45 : 45, 
                    minRotation: isMobile ? 45 : 45,
                    font: { size: isMobile ? 8 : 11 },
                    autoSkip: true,
                    maxTicksLimit: isMobile ? 8 : 15
                }
            }
        }
    };
    
    const datasets = [
        {
            label: 'Endring (cm)',
            data: changeData,
            backgroundColor: backgroundColors,
            borderRadius: 4,
            borderSkipped: false,
            barPercentage: isMobile ? 0.5 : 0.4,
            categoryPercentage: isMobile ? 0.7 : 0.8,
            minBarLength: 3  // KEY FIX: Forces zero bars to be 3px tall
        }
    ];
    
    if (changeData.length >= 3 && trendLineData !== changeData) {
        datasets.push({
            label: 'Trendlinje',
            data: trendLineData,
            type: 'line',
            borderColor: '#1a73e8',
            backgroundColor: 'transparent',
            borderWidth: isMobile ? 1.5 : 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 1
        });
    }
    
    if (changeData.length > 0) {
        datasets.push({
            label: `Gj.snitt (${averageValue.toFixed(1)} cm)`,
            data: Array(changeData.length).fill(averageValue),
            type: 'line',
            borderColor: '#ea4335',
            backgroundColor: 'transparent',
            borderWidth: isMobile ? 1.5 : 2,
            borderDash: [],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 0
        });
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: datasets },
        options: chartOptions
    });
    
    document.getElementById('graphModal').style.display = 'block';
}
    
    const datasets = [
        {
            label: 'Endring (cm)',
            data: changeData,
            backgroundColor: backgroundColors,
            borderRadius: 4,
            borderSkipped: false,
            barPercentage: isMobile ? 0.5 : 0.4,
            categoryPercentage: isMobile ? 0.7 : 0.8
        }
    ];
    
    if (changeData.length >= 3 && trendLineData !== changeData) {
        datasets.push({
            label: 'Trendlinje',
            data: trendLineData,
            type: 'line',
            borderColor: '#1a73e8',
            backgroundColor: 'transparent',
            borderWidth: isMobile ? 1.5 : 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 1
        });
    }
    
    if (changeData.length > 0) {
        datasets.push({
            label: `Gj.snitt (${averageValue.toFixed(1)} cm)`,
            data: Array(changeData.length).fill(averageValue),
            type: 'line',
            borderColor: '#ea4335',
            backgroundColor: 'transparent',
            borderWidth: isMobile ? 1.5 : 2,
            borderDash: [],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 0
        });
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: datasets },
        options: chartOptions
    });
    
    document.getElementById('graphModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('graphModal').style.display = 'none';
}

function init() {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            allRows = results.data.filter(row => row.Date && row["Water Level (moh)"]);
            allRows.sort((a, b) => {
                const dateA = getDateObject(a.Date);
                const dateB = getDateObject(b.Date);
                return dateB - dateA;
            });
            
            populateYearOptions();
            populateMonthOptions();
            updateLatestCard();
            renderTable();
            
            document.getElementById('yearSelect').addEventListener('change', function() {
                selectedYear = this.value;
                selectedMonth = 'all';
                document.getElementById('monthSelect').value = 'all';
                populateMonthOptions();
                renderTable();
            });
            
            document.getElementById('monthSelect').addEventListener('change', function() {
                selectedMonth = this.value;
                renderTable();
            });
            
            document.getElementById('refreshBtn').onclick = function(e) { e.preventDefault(); refreshData(); };
            document.getElementById('exportBtn').onclick = function(e) { e.preventDefault(); exportToCSV(); };
            document.getElementById('graphBtn').onclick = function(e) { e.preventDefault(); showGraph(); };
            
            document.querySelector('.modal-close').onclick = closeModal;
            window.onclick = function(event) {
                if (event.target === document.getElementById('graphModal')) closeModal();
            };
        }
    });
}

init();
