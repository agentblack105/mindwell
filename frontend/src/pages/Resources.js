// ─── Resources Page ───────────────────────────────────────────────────────
export function ResourcesPage(container) {
  container.innerHTML = `
        <div id="resourcesSection" class="container">
            <div class="resource-directory">
                <h2 class="section-title" id="resourcesTitle">Find Help Near You</h2>

                <div class="filters">
                    <select class="filter-select" id="stateFilter">
                        <option value="" id="allStates">All States</option>
                        <option value="lagos">Lagos</option>
                        <option value="ogun">Ogun</option>
                        <option value="abuja">Abuja</option>
                        <option value="rivers">Rivers</option>
                        <option value="kaduna">Kaduna</option>
                        <option value="kano">Kano</option>
                    </select>
                    <select class="filter-select" id="serviceFilter">
                        <option value="" id="allServices">All Services</option>
                        <option value="crisis" id="crisisHotline">Crisis Hotline</option>
                        <option value="therapy" id="therapist">Therapist</option>
                        <option value="support" id="supportGroup">Support Group</option>
                        <option value="clinic" id="clinic">Mental Health Clinic</option>
                    </select>
                </div>

                <div class="resource-grid" id="resourceGrid">
                    ${RESOURCES.map(r => `
                        <div class="resource-card" data-state="${r.state}" data-service="${r.service}">
                            <div class="resource-name">${r.name}</div>
                            <span class="resource-type">${r.serviceLabel}</span>
                            ${r.phone ? `<div class="resource-contact">📞 ${r.phone}</div>` : ''}
                            ${r.email ? `<div class="resource-contact">📧 ${r.email}</div>` : ''}
                            ${r.hours ? `<div class="resource-phone">${r.hours}</div>` : ''}
                            <div class="resource-location">📍 ${r.location}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

  const stateF = document.getElementById('stateFilter');
  const serviceF = document.getElementById('serviceFilter');
  const filter = () => {
    const sv = stateF.value, sev = serviceF.value;
    document.querySelectorAll('.resource-card').forEach(card => {
      const matchState = !sv || card.dataset.state === sv || card.dataset.state === 'all';
      const matchService = !sev || card.dataset.service === sev;
      card.style.display = matchState && matchService ? '' : 'none';
    });
  };
  stateF?.addEventListener('change', filter);
  serviceF?.addEventListener('change', filter);
}

const RESOURCES = [
  { name: 'Lagos Suicide Prevention Hotline', state: 'lagos', service: 'crisis', serviceLabel: 'Crisis Hotline', phone: '0800 111 6264', hours: '24/7 Toll-Free', location: 'Lagos State' },
  { name: 'Federal Neuro-Psychiatric Hospital Yaba', state: 'lagos', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '0802 307 6932', email: 'info@neuroyaba.org.ng', location: '7 Harvey Road, Yaba, Lagos' },
  { name: 'Mentally Aware Nigeria Initiative (MANI)', state: 'all', service: 'support', serviceLabel: 'Support Group', phone: '0809 111 6264', email: 'info@mentallyaware.org', location: 'Lagos (Virtual available)' },
  { name: 'FCT Suicide Prevention Hotline', state: 'abuja', service: 'crisis', serviceLabel: 'Crisis Hotline', phone: '0809 777 6264', hours: '24/7', location: 'Abuja' },
  { name: 'National Hospital Abuja — Psychiatry', state: 'abuja', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '09 461 0000', email: 'info@nationalhospital.gov.ng', location: 'Central Area, Abuja' },
  { name: 'Neuro-Psychiatric Hospital Aro', state: 'ogun', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '0803 403 3894', location: 'Abeokuta, Ogun State' },
  { name: 'Federal Neuro-Psychiatric Hospital Kano', state: 'kano', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '064 311 062', location: 'Kano State' },
  { name: 'Neuro-Psychiatric Hospital Rumuigbo', state: 'rivers', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '0803 704 9000', location: 'Port Harcourt, Rivers State' },
  { name: 'Federal Neuro-Psychiatric Hospital Kaduna', state: 'kaduna', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '062 200 235', location: 'Kaduna State' },
  { name: 'Sobi FM Suicide Prevention Helpline', state: 'all', service: 'crisis', serviceLabel: 'Crisis Hotline', phone: '0800 800 2000', hours: 'National Hotline', location: 'Nigeria-wide' },
  { name: 'Lagos State University Teaching Hospital — Psychiatry', state: 'lagos', service: 'clinic', serviceLabel: 'Mental Health Clinic', phone: '0802 345 6789', location: 'Ikeja, Lagos' },
  { name: 'She Writes Woman Foundation', state: 'all', service: 'support', serviceLabel: 'Support Group', email: 'hello@shewriteswoman.org', location: 'Lagos (Virtual available)' },
];
