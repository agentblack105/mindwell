// ============================================================================
// RESOURCES FUNCTIONS - Resource Directory and Filtering
// ============================================================================

// DOM Elements
const stateFilter = document.getElementById('stateFilter');
const serviceFilter = document.getElementById('serviceFilter');
const resourceGrid = document.getElementById('resourceGrid');
const resourceCards = document.querySelectorAll('.resource-card');

// Filter resources by state and service
function filterResources() {
    if (!stateFilter || !serviceFilter) return;
    
    const state = stateFilter.value;
    const service = serviceFilter.value;
    
    resourceCards.forEach(card => {
        const cardState = card.dataset.state || '';
        const cardService = card.dataset.service || '';
        
        let show = true;
        if (state && cardState !== state) show = false;
        if (service && cardService !== service) show = false;
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Add event listeners for filters
if (stateFilter && serviceFilter) {
    stateFilter.addEventListener('change', filterResources);
    serviceFilter.addEventListener('change', filterResources);
}

// Update resource cards with translations
function updateResourceCards(t) {
    if (!resourceCards || resourceCards.length === 0) return;
    
    try {
        // Lagos Hotline (index 0)
        if (resourceCards[0]) {
            const nameEl = resourceCards[0].querySelector('.resource-name');
            const typeEl = resourceCards[0].querySelector('.resource-type');
            const phoneEl = resourceCards[0].querySelector('.resource-phone');
            const locationEl = resourceCards[0].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.lagosHotline;
            if (typeEl) typeEl.textContent = t.lagosHotlineType;
            if (phoneEl) phoneEl.textContent = t.lagosHotlinePhone;
            if (locationEl) locationEl.innerHTML = `📍 ${t.lagosHotlineLocation}`;
        }
        
        // Yaba Hospital (index 1)
        if (resourceCards[1]) {
            const nameEl = resourceCards[1].querySelector('.resource-name');
            const typeEl = resourceCards[1].querySelector('.resource-type');
            const locationEl = resourceCards[1].querySelector('.resource-location');
            const contacts = resourceCards[1].querySelectorAll('.resource-contact');
            
            if (nameEl) nameEl.textContent = t.yabaHospital;
            if (typeEl) typeEl.textContent = t.yabaHospitalType;
            if (contacts[0]) contacts[0].innerHTML = `📞 ${t.yabaHospitalContact1}`;
            if (contacts[1]) contacts[1].innerHTML = `📧 ${t.yabaHospitalContact2}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.yabaHospitalLocation}`;
        }
        
        // MANI (index 2)
        if (resourceCards[2]) {
            const nameEl = resourceCards[2].querySelector('.resource-name');
            const typeEl = resourceCards[2].querySelector('.resource-type');
            const locationEl = resourceCards[2].querySelector('.resource-location');
            const contacts = resourceCards[2].querySelectorAll('.resource-contact');
            
            if (nameEl) nameEl.textContent = t.mani;
            if (typeEl) typeEl.textContent = t.maniType;
            if (contacts[0]) contacts[0].innerHTML = `📞 ${t.maniContact1}`;
            if (contacts[1]) contacts[1].innerHTML = `📧 ${t.maniContact2}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.maniLocation}`;
        }
        
        // Abuja Hotline (index 3)
        if (resourceCards[3]) {
            const nameEl = resourceCards[3].querySelector('.resource-name');
            const typeEl = resourceCards[3].querySelector('.resource-type');
            const phoneEl = resourceCards[3].querySelector('.resource-phone');
            const locationEl = resourceCards[3].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.abujaHotline;
            if (typeEl) typeEl.textContent = t.abujaHotlineType;
            if (phoneEl) phoneEl.textContent = t.abujaHotlinePhone;
            if (locationEl) locationEl.innerHTML = `📍 ${t.abujaHotlineLocation}`;
        }
        
        // Abuja Hospital (index 4)
        if (resourceCards[4]) {
            const nameEl = resourceCards[4].querySelector('.resource-name');
            const typeEl = resourceCards[4].querySelector('.resource-type');
            const locationEl = resourceCards[4].querySelector('.resource-location');
            const contacts = resourceCards[4].querySelectorAll('.resource-contact');
            
            if (nameEl) nameEl.textContent = t.abujaHospital;
            if (typeEl) typeEl.textContent = t.abujaHospitalType;
            if (contacts[0]) contacts[0].innerHTML = `📞 ${t.abujaHospitalContact1}`;
            if (contacts[1]) contacts[1].innerHTML = `📧 ${t.abujaHospitalContact2}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.abujaHospitalLocation}`;
        }
        
        // Aro Hospital (index 5)
        if (resourceCards[5]) {
            const nameEl = resourceCards[5].querySelector('.resource-name');
            const typeEl = resourceCards[5].querySelector('.resource-type');
            const contactEl = resourceCards[5].querySelector('.resource-contact');
            const locationEl = resourceCards[5].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.aroHospital || "Neuro-Psychiatric Hospital Aro";
            if (typeEl) typeEl.textContent = t.aroHospitalType || t.clinic;
            if (contactEl) contactEl.innerHTML = `📞 ${t.aroHospitalContact || "0803 403 3894"}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.aroHospitalLocation || "Abeokuta, Ogun State"}`;
        }
        
        // Kano Hospital (index 6)
        if (resourceCards[6]) {
            const nameEl = resourceCards[6].querySelector('.resource-name');
            const typeEl = resourceCards[6].querySelector('.resource-type');
            const contactEl = resourceCards[6].querySelector('.resource-contact');
            const locationEl = resourceCards[6].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.kanoHospital;
            if (typeEl) typeEl.textContent = t.kanoHospitalType;
            if (contactEl) contactEl.innerHTML = `📞 ${t.kanoHospitalContact}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.kanoHospitalLocation}`;
        }
        
        // Rivers Hospital (index 7)
        if (resourceCards[7]) {
            const nameEl = resourceCards[7].querySelector('.resource-name');
            const typeEl = resourceCards[7].querySelector('.resource-type');
            const contactEl = resourceCards[7].querySelector('.resource-contact');
            const locationEl = resourceCards[7].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.riversHospital;
            if (typeEl) typeEl.textContent = t.riversHospitalType;
            if (contactEl) contactEl.innerHTML = `📞 ${t.riversHospitalContact}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.riversHospitalLocation}`;
        }
        
        // Kaduna Hospital (index 8)
        if (resourceCards[8]) {
            const nameEl = resourceCards[8].querySelector('.resource-name');
            const typeEl = resourceCards[8].querySelector('.resource-type');
            const contactEl = resourceCards[8].querySelector('.resource-contact');
            const locationEl = resourceCards[8].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.kadunaHospital;
            if (typeEl) typeEl.textContent = t.kadunaHospitalType;
            if (contactEl) contactEl.innerHTML = `📞 ${t.kadunaHospitalContact}`;
            if (locationEl) locationEl.innerHTML = `📍 ${t.kadunaHospitalLocation}`;
        }
        
        // Sobi Hotline (index 9)
        if (resourceCards[9]) {
            const nameEl = resourceCards[9].querySelector('.resource-name');
            const typeEl = resourceCards[9].querySelector('.resource-type');
            const phoneEl = resourceCards[9].querySelector('.resource-phone');
            const locationEl = resourceCards[9].querySelector('.resource-location');
            
            if (nameEl) nameEl.textContent = t.sobiHotline;
            if (typeEl) typeEl.textContent = t.sobiHotlineType;
            if (phoneEl) phoneEl.textContent = t.sobiHotlinePhone;
            if (locationEl) locationEl.innerHTML = `📍 ${t.sobiHotlineLocation}`;
        }
    } catch (error) {
        console.log('Error updating resource cards:', error);
    }
}