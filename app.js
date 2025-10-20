let map, markers = [], allData = [], infoWindow;
let selectedFamilias = [];
let allFamilias = [];
let isCompactView = false;
let isFirstLoad = true; // 👈 NUEVA variable para detectar primera carga


const familyColors = {
    'Informática y Comunicaciones': '#3498db',
    'Administración y Gestión': '#e74c3c',
    'Sanidad': '#2ecc71',
    'Comercio y Marketing': '#f39c12',
    'Servicios Socioculturales y a la Comunidad': '#9b59b6',
    'Hostelería y Turismo': '#1abc9c',
    'Electricidad y Electrónica': '#e67e22',
    'Transporte y Mantenimiento de Vehículos': '#34495e',
    'Imagen Personal': '#e91e63',
    'Edificación y obra civil': '#795548',
    'Fabricación Mecánica': '#607d8b',
    'Instalación y Mantenimiento': '#ff5722',
    'Artes Gráficas': '#673ab7',
    'Imagen y Sonido': '#00bcd4',
    'Actividades Físicas y Deportivas': '#4caf50',
    'Agraria': '#8bc34a',
    'Química': '#cddc39',
    'Seguridad y Medio Ambiente': '#ffc107',
    'Energía y Agua': '#ff9800',
    'Textil, Confección y Piel': '#9c27b0',
    'Madera, Mueble y Corcho': '#795548',
    'Industrias Alimentarias': '#f44336',
    'Marítimo - Pesquera': '#2196f3',
    'Artes y Artesanías': '#ff6f00'
};


const familyIcons = {
    'Informática y Comunicaciones': '💻',
    'Administración y Gestión': '📊',
    'Sanidad': '⚕️',
    'Comercio y Marketing': '🛒',
    'Servicios Socioculturales y a la Comunidad': '🤝',
    'Hostelería y Turismo': '🏨',
    'Electricidad y Electrónica': '⚡',
    'Transporte y Mantenimiento de Vehículos': '🚗',
    'Imagen Personal': '💇',
    'Edificación y obra civil': '🏗️',
    'Fabricación Mecánica': '⚙️',
    'Instalación y Mantenimiento': '🔧',
    'Artes Gráficas': '🎨',
    'Imagen y Sonido': '🎬',
    'Actividades Físicas y Deportivas': '⚽',
    'Agraria': '🌾',
    'Química': '🧪',
    'Seguridad y Medio Ambiente': '🛡️',
    'Energía y Agua': '💧',
    'Textil, Confección y Piel': '👔',
    'Madera, Mueble y Corcho': '🪵',
    'Industrias Alimentarias': '🍞',
    'Marítimo - Pesquera': '⚓',
    'Artes y Artesanías': '🎭'
};

async function initMap() {
    try {
        while (!window.google || !window.google.maps) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        map = new Map(document.getElementById("map"), {
            zoom: 9,
            center: { lat: 36.7213, lng: -4.4214 },
            mapId: 'DEMO_MAP_ID',
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
			 gestureHandling: 'greedy',
			 restriction: {
        restriction: {
    latLngBounds: {
        north: 37.3,    // Más amplio al norte
        south: 36.35,   // Más estricto al sur
        west: -5.7,     // Más amplio al oeste
        east: -3.7      // Más amplio al este
    },
    strictBounds: true
},
        strictBounds: true  // Impide mover el mapa fuera de estos límites
    },
    // 👇 NUEVO: Límites de zoom
    minZoom: 8,   // Zoom mínimo (no se puede alejar más)
    maxZoom: 18   // Zoom máximo (no se puede acercar más)
        });

        infoWindow = new google.maps.InfoWindow();

        loadData();
        populateFilters();
        createLegend();
        displayMarkers(allData);
    } catch (error) {
        console.error('Error initializing map:', error);
        document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#e74c3c;text-align:center;padding:20px;"><p>⚠️ Error al cargar el mapa.<br><small>' + error.message + '</small></p></div>';
    }
}

function loadData() {
    if (typeof CENTROS_DATA !== 'undefined') {
        allData = CENTROS_DATA.filter(d => d.latitud && d.longitud);
        console.log('Datos cargados:', allData.length, 'registros');
    } else {
        console.error('No se encontró CENTROS_DATA. Asegúrate de que el archivo datos.js esté cargado.');
    }
}

function populateFilters() {
    const familias = [...new Set(allData.map(d => d['Familia Profesional']))].filter(Boolean).sort();
    const ensenanzas = [...new Set(allData.map(d => d.ENSEÑANZA))].filter(Boolean).sort();
    const localidades = [...new Set(allData.map(d => d.LOCALIDAD))].filter(Boolean).sort();

    allFamilias = familias;

    const optionsContainer = document.getElementById('multiselectOptions');
    optionsContainer.innerHTML = '';
    
    familias.forEach((f, index) => {
    const option = document.createElement('div');
    option.className = 'multiselect-option';
    option.setAttribute('data-familia', f);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `familia_${index}`;
    checkbox.value = f;
    checkbox.addEventListener('change', () => {
        updateMultiselectSelection();
        // 👇 Cerrar con retraso suave
        setTimeout(() => {
            closeMultiselect();
        }, 400);
    });

    const label = document.createElement('label');
    label.htmlFor = `familia_${index}`;
	const icon = familyIcons[f] || '📚'; // 📚 es el icono por defecto
    label.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">${icon}</span>${f}`;
    label.textContent = f;
    label.addEventListener('click', (e) => {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        updateMultiselectSelection();
        // 👇 Cerrar con retraso suave
        setTimeout(() => {
            closeMultiselect();
        }, 200);
    });

    option.appendChild(checkbox);
    option.appendChild(label);
    optionsContainer.appendChild(option);
});

    const selects = {
        ensenanzaFilter: ensenanzas,
        localidadFilter: localidades
    };

    for (const [selectId, values] of Object.entries(selects)) {
        const select = document.getElementById(selectId);
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        values.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            select.appendChild(opt);
        });
    }

document.getElementById('searchInput').addEventListener('input', () => {
    isFirstLoad = false; // 👈 Marcar que ya no es primera carga
    applyFilters();
});    document.getElementById('multiselectSearch').addEventListener('input', filterMultiselectOptions);

    document.addEventListener('click', (e) => {
        const container = document.getElementById('familiaMultiselect');
        if (!container.contains(e.target)) {
            closeMultiselect();
        }
    });
}

function toggleMultiselect() {
    const dropdown = document.getElementById('multiselectDropdown');
    const arrow = document.querySelector('.multiselect-arrow');
    const header = document.querySelector('.multiselect-header');
    
    dropdown.classList.toggle('show');
    arrow.classList.toggle('open');
    header.classList.toggle('active');
}

function closeMultiselect() {
    const dropdown = document.getElementById('multiselectDropdown');
    const arrow = document.querySelector('.multiselect-arrow');
    const header = document.querySelector('.multiselect-header');
    
    dropdown.classList.remove('show');
    arrow.classList.remove('open');
    header.classList.remove('active');
}

function updateMultiselectSelection() {
    const checkboxes = document.querySelectorAll('#multiselectOptions input[type="checkbox"]:checked');
    selectedFamilias = Array.from(checkboxes).map(cb => cb.value);
    
    const selectedContainer = document.getElementById('multiselectSelected');
    selectedContainer.innerHTML = '';

    if (selectedFamilias.length === 0) {
        selectedContainer.innerHTML = '<span class="multiselect-placeholder">Selecciona una o más familias profesionales...</span>';
    } else {
     selectedFamilias.forEach(familia => {
    const tag = document.createElement('div');
    tag.className = 'multiselect-tag';
    const icon = familyIcons[familia] || '📚';
    tag.innerHTML = `
        <span style="font-size: 14px;">${icon}</span>
        ${familia}
        <span class="multiselect-tag-close" onclick="removeFamilia(event, '${familia}')">×</span>
    `;
    selectedContainer.appendChild(tag);
});
    }
}

function removeFamilia(event, familia) {
    event.stopPropagation();
    const checkbox = document.querySelector(`#multiselectOptions input[value="${familia}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateMultiselectSelection();
        applyFilters();
    }
}

function filterMultiselectOptions() {
    const searchTerm = document.getElementById('multiselectSearch').value.toLowerCase();
    const options = document.querySelectorAll('.multiselect-option');

    options.forEach(option => {
        const familia = option.getAttribute('data-familia').toLowerCase();
        if (familia.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

function selectAllFamilias(event) {
    event.stopPropagation();
    const checkboxes = document.querySelectorAll('#multiselectOptions input[type="checkbox"]');
    const visibleCheckboxes = Array.from(checkboxes).filter(cb => 
        cb.closest('.multiselect-option').style.display !== 'none'
    );
    
    visibleCheckboxes.forEach(cb => cb.checked = true);
    updateMultiselectSelection();
    applyFilters();
}

function clearAllFamilias(event) {
    event.stopPropagation();
    const checkboxes = document.querySelectorAll('#multiselectOptions input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    updateMultiselectSelection();
    applyFilters();
}

function createLegend() {
    const legendItems = document.getElementById('legendItems');
    const familias = [...new Set(allData.map(d => d['Familia Profesional']))].filter(Boolean).sort();

    familias.forEach(f => {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const color = document.createElement('div');
    color.className = 'legend-color';
    color.style.backgroundColor = familyColors[f] || '#95a5a6';

    const icon = familyIcons[f] || '📚';
    const text = document.createElement('span');
    text.innerHTML = `<span style="font-size: 16px; margin-right: 6px;">${icon}</span>${f}`;

    item.append(color, text);
    legendItems.appendChild(item);
});
}

async function displayMarkers(data) {
    markers.forEach(m => m.map = null);
    markers = [];

    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const grouped = {};
    data.forEach(d => {
        const key = `${d.Centro}_${d.latitud}_${d.longitud}`;
        if (!grouped[key]) {
            grouped[key] = {
                Centro: d.Centro,
                LOCALIDAD: d.LOCALIDAD,
                latitud: d.latitud,
                longitud: d.longitud,
                ciclos: []
            };
        }
        grouped[key].ciclos.push({
            ciclo: d['Ciclo Formativo'],
            familia: d['Familia Profesional'],
            ensenanza: d.ENSEÑANZA
        });
    });

    const bounds = new google.maps.LatLngBounds();

    Object.values(grouped).forEach(centro => {
        const color = familyColors[centro.ciclos[0].familia] || '#95a5a6';
        const pin = new PinElement({
            background: color,
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            scale: 1.2
        });

        const marker = new AdvancedMarkerElement({
            map: map,
            position: { lat: centro.latitud, lng: centro.longitud },
            title: centro.Centro,
            content: pin.element
        });

        marker.addListener('click', () => {
            const ciclosHTML = centro.ciclos.map(c => `
                <div style="margin: 10px 0; padding: 12px; background: linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%); border-radius: 8px; border-left: 4px solid ${familyColors[c.familia] || '#95a5a6'};">
                    <div style="font-weight: 600; color: #009245; font-size: 14px; margin-bottom: 6px; line-height: 1.4;">${c.ciclo}</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="background: #009245; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">📚 ${c.ensenanza}</span>
                        </div>
                        <div style="color: #58595B; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                            <span style="color: ${familyColors[c.familia] || '#95a5a6'}; font-weight: 600;">●</span>
                            ${c.familia}
                        </div>
                    </div>
                </div>
            `).join('');

            const content = `
                <div style="min-width: 320px; max-width: 380px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="background: linear-gradient(135deg, #009245 0%, #8BC53F 100%); padding: 20px; margin: -20px -20px 15px -20px; border-radius: 12px 12px 0 0;">
                        <h3 style="margin: 0; color: #FFFFFF; font-size: 18px; font-weight: 700; line-height: 1.3; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${centro.Centro}</h3>
                        <div style="margin-top: 8px; display: flex; align-items: center; gap: 6px; color: #FFFFFF; font-size: 14px; opacity: 0.95;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            ${centro.LOCALIDAD}
                        </div>
                    </div>
                    <div style="padding: 0 5px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 10px; background: #f0f4f0; border-radius: 8px;">
                            <span style="color: #009245; font-weight: 700; font-size: 15px;">Ciclos formativos</span>
                            <span style="background: #009245; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700;">${centro.ciclos.length}</span>
                        </div>
                        <div style="max-height: 320px; overflow-y: auto; padding-right: 5px;">
                            ${ciclosHTML}
                        </div>
                    </div>
                </div>
            `;

            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
        bounds.extend(marker.position);
    });

    if (markers.length > 0) {
    map.fitBounds(bounds);
    if (markers.length === 1) {
        map.setZoom(14);
    }
}

		updateStats(data, true); // 👈 Añadir 'true' para saltar la lista en la carga inicial
}

function updateStats(data) {
    const centros = new Set(data.map(d => `${d.Centro}_${d.latitud}_${d.longitud}`));
    document.getElementById('centrosCount').textContent = centros.size;
    document.getElementById('ciclosCount').textContent = data.length;
    
    const pdfButton = document.getElementById('pdfButton');
    pdfButton.disabled = data.length === 0;

    // 👇 Solo actualizar lista si NO es la primera carga
    if (!isFirstLoad) {
        updateResultsList(data);
    } else {
        // Mostrar mensaje inicial
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">
                    <strong>Utiliza los filtros para buscar centros</strong><br>
                    <small style="color: #95a5a6; margin-top: 10px; display: block;">
                        Puedes filtrar por nombre, familia profesional, tipo de enseñanza o localidad
                    </small>
                </div>
            </div>
        `;
    }
}

function updateResultsList(data) {
    console.log('Actualizando lista de resultados con', data.length, 'registros');
    
    const resultsList = document.getElementById('resultsList');
    
    if (!resultsList) {
        console.error('No se encontró el elemento resultsList');
        return;
    }
    
    if (data.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No se encontraron centros con los filtros aplicados</div>
            </div>
        `;
        return;
    }

    const grouped = {};
    data.forEach(d => {
        const key = `${d.Centro}_${d.latitud}_${d.longitud}`;
        if (!grouped[key]) {
            grouped[key] = {
                Centro: d.Centro,
                LOCALIDAD: d.LOCALIDAD,
                latitud: d.latitud,
                longitud: d.longitud,
                ciclos: []
            };
        }
        grouped[key].ciclos.push({
            ciclo: d['Ciclo Formativo'],
            familia: d['Familia Profesional'],
            ensenanza: d.ENSEÑANZA
        });
    });

    const centros = Object.values(grouped);
    console.log('Centros agrupados:', centros.length);
    
    const compactClass = isCompactView ? 'compact' : '';
    
    const centrosHTML = centros.map((centro, index) => {
        const familias = [...new Set(centro.ciclos.map(c => c.familia))];
        
        const ciclosHTML = centro.ciclos.map(c => {
            const color = familyColors[c.familia] || '#95a5a6';
            return `
                <div class="ciclo-item" style="border-left-color: ${color}">
                    <div class="ciclo-name">${c.ciclo}</div>
                    <div class="ciclo-details">
                        <div class="ciclo-badge">
                            <span style="color: ${color}; font-weight: bold;">●</span>
                            <span class="ciclo-familia">${c.familia}</span>
                        </div>
                        <div class="ciclo-badge">
                            📚 ${c.ensenanza}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const nombreEscapado = centro.Centro.replace(/'/g, "\\'");

        return `
            <div class="center-card ${compactClass}">
                <div class="center-header">
                    <div class="center-info">
                        <div class="center-name">${centro.Centro}</div>
                        <div class="center-location">
                            <svg width="14" height="14" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            ${centro.LOCALIDAD}
                        </div>
                        <div class="center-stats">
                            <div class="center-stat-badge">
                                📚 ${centro.ciclos.length} ${centro.ciclos.length === 1 ? 'ciclo' : 'ciclos'}
                            </div>
                            <div class="center-stat-badge">
                                🎓 ${familias.length} ${familias.length === 1 ? 'familia' : 'familias'}
                            </div>
                        </div>
                    </div>
                    <div class="center-actions">
                        <button class="btn-view-map" onclick="focusOnCenter(${centro.latitud}, ${centro.longitud}, '${nombreEscapado}')">
                            📍 Ver en mapa
                        </button>
                    </div>
                </div>
                <div class="ciclos-list">
                    <div class="ciclos-toggle" onclick="toggleCiclos(${index})">
                        <div class="ciclos-header">
                            <span>Ciclos formativos disponibles</span>
                            <span class="toggle-icon" id="toggleIcon${index}">▼</span>
                        </div>
                    </div>
                    <div class="ciclos-items" id="ciclosItems${index}">
                        ${ciclosHTML}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    resultsList.innerHTML = centrosHTML;
    resultsList.className = `results-list ${compactClass}`;
    console.log('Lista actualizada correctamente');
}

function toggleListView() {
    isCompactView = !isCompactView;
    const viewIcon = document.getElementById('viewIcon');
    const viewText = document.getElementById('viewText');
    
    if (isCompactView) {
        viewIcon.textContent = '📋';
        viewText.textContent = 'Vista Detallada';
    } else {
        viewIcon.textContent = '📑';
        viewText.textContent = 'Vista Compacta';
    }

    applyFilters();
}

function toggleCiclos(index) {
    const ciclosItems = document.getElementById(`ciclosItems${index}`);
    const toggleIcon = document.getElementById(`toggleIcon${index}`);
    
    if (ciclosItems && toggleIcon) {
        ciclosItems.classList.toggle('collapsed');
        toggleIcon.classList.toggle('open');
    }
}

function focusOnCenter(lat, lng, nombre) {
    map.setCenter({ lat: lat, lng: lng });
    map.setZoom(15);
    
    const marker = markers.find(m => 
        Math.abs(m.position.lat - lat) < 0.0001 && 
        Math.abs(m.position.lng - lng) < 0.0001
    );
    
    if (marker) {
        google.maps.event.trigger(marker, 'click');
    }

    document.getElementById('map').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function applyFilters() {
    isFirstLoad = false; // 👈 NUEVO: Marcar que ya no es la primera carga
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const e = document.getElementById('ensenanzaFilter').value;
    const l = document.getElementById('localidadFilter').value;

    let filtered = allData;

    if (searchTerm) {
        filtered = filtered.filter(d => d.Centro.toLowerCase().includes(searchTerm));
    }

    if (selectedFamilias.length > 0) {
        filtered = filtered.filter(d => selectedFamilias.includes(d['Familia Profesional']));
    }

    if (e) {
        filtered = filtered.filter(d => d.ENSEÑANZA === e);
    }

    if (l) {
        filtered = filtered.filter(d => d.LOCALIDAD === l);
    }

    displayMarkers(filtered);
}

function resetFilters() {
	isFirstLoad = false; // 👈 NUEVO: Al resetear también se muestra la lista

    document.getElementById('searchInput').value = '';
    document.getElementById('ensenanzaFilter').value = '';
    document.getElementById('localidadFilter').value = '';
    
    const checkboxes = document.querySelectorAll('#multiselectOptions input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    updateMultiselectSelection();
    
    document.getElementById('multiselectSearch').value = '';
    filterMultiselectOptions();
    
    displayMarkers(allData);
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const e = document.getElementById('ensenanzaFilter').value;
    const l = document.getElementById('localidadFilter').value;

    let filtered = allData;

    if (searchTerm) {
        filtered = filtered.filter(d => d.Centro.toLowerCase().includes(searchTerm));
    }

    if (selectedFamilias.length > 0) {
        filtered = filtered.filter(d => selectedFamilias.includes(d['Familia Profesional']));
    }

    if (e) {
        filtered = filtered.filter(d => d.ENSEÑANZA === e);
    }

    if (l) {
        filtered = filtered.filter(d => d.LOCALIDAD === l);
    }

    if (filtered.length === 0) {
        alert('No hay centros para exportar con los filtros actuales');
        return;
    }

    const grouped = {};
    filtered.forEach(d => {
        const key = `${d.Centro}_${d.latitud}_${d.longitud}`;
        if (!grouped[key]) {
            grouped[key] = {
                Centro: d.Centro,
                LOCALIDAD: d.LOCALIDAD,
                ciclos: []
            };
        }
        grouped[key].ciclos.push({
            ciclo: d['Ciclo Formativo'],
            familia: d['Familia Profesional'],
            ensenanza: d.ENSEÑANZA
        });
    });

    const centros = Object.values(grouped);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFillColor(0, 146, 69);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Centros de Formación Profesional - Málaga', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Consejería de Desarrollo Educativo y Formación Profesional', pageWidth / 2, 23, { align: 'center' });
    
    const fecha = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.setFontSize(8);
    doc.text(`Generado el: ${fecha}`, pageWidth / 2, 30, { align: 'center' });

    let yPos = 45;
    doc.setTextColor(0, 146, 69);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Filtros Aplicados:', 14, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(88, 89, 91);

    if (searchTerm) {
        doc.text(`• Búsqueda: "${searchTerm}"`, 14, yPos);
        yPos += 5;
    }

    if (selectedFamilias.length > 0) {
        const familiasText = selectedFamilias.length > 3 
            ? `${selectedFamilias.slice(0, 3).join(', ')}... (+${selectedFamilias.length - 3} más)`
            : selectedFamilias.join(', ');
        doc.text(`• Familias: ${familiasText}`, 14, yPos);
        yPos += 5;
    }

    if (e) {
        doc.text(`• Enseñanza: ${e}`, 14, yPos);
        yPos += 5;
    }

    if (l) {
        doc.text(`• Localidad: ${l}`, 14, yPos);
        yPos += 5;
    }

    yPos += 3;
    doc.setFillColor(240, 244, 240);
    doc.roundedRect(14, yPos, pageWidth - 28, 12, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 146, 69);
    doc.text(`Total de centros encontrados: ${centros.length} | Ciclos formativos: ${filtered.length}`, pageWidth / 2, yPos + 7, { align: 'center' });

    yPos += 20;

    centros.forEach((centro, index) => {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFillColor(0, 146, 69);
        doc.roundedRect(14, yPos, pageWidth - 28, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${centro.Centro}`, 16, yPos + 5.5);

        yPos += 10;

        doc.setTextColor(88, 89, 91);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Localidad: ${centro.LOCALIDAD}`, 16, yPos);
        yPos += 2;

        const tableData = centro.ciclos.map(c => [
            c.ciclo,
            c.familia,
            c.ensenanza
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Ciclo Formativo', 'Familia Profesional', 'Enseñanza']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [139, 197, 63],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [88, 89, 91]
            },
            alternateRowStyles: {
                fillColor: [248, 253, 249]
            },
            margin: { left: 14, right: 14 },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 65 },
                2: { cellWidth: 45 }
            }
        });

        yPos = doc.lastAutoTable.finalY + 8;
    });

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    const nombreArchivo = `centros-fp-malaga-${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
}

// Exponer funciones globalmente
window.initMap = initMap; // ⭐ ESTO ES LO IMPORTANTE
window.toggleMultiselect = toggleMultiselect;
window.removeFamilia = removeFamilia;
window.selectAllFamilias = selectAllFamilias;
window.clearAllFamilias = clearAllFamilias;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.generatePDF = generatePDF;
window.toggleListView = toggleListView;
window.toggleCiclos = toggleCiclos;

window.focusOnCenter = focusOnCenter;
