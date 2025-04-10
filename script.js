// HealthGuardian - Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // Global Variables
    // ======================
    let currentSection = 'home';
    let emergencyType = 'other';
    let isSOSActive = false;
    let pressTimer;
    let userLocation = null;

    // ======================
    // DOM Elements
    // ======================
    const sections = {
        home: document.querySelector('.home-section'),
        emergency: document.querySelector('.emergency-section'),
        hospital: document.querySelector('.hospital-finder-section'),
        ai: document.querySelector('.ai-assistant-section'),
        blood: document.querySelector('.blood-bank-section')
    };

    const navLinks = document.querySelectorAll('nav a');
    const sosButton = document.getElementById('sosButton');
    const emergencyInfo = document.getElementById('emergencyInfo');
    const emergencyTipsList = document.getElementById('emergencyTipsList');
    const typeButtons = document.querySelectorAll('.type-btn');
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
    const locationInput = document.getElementById('locationInput');
    const hospitalList = document.getElementById('hospitalList');
    const bloodBankList = document.getElementById('bloodBankList');
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendMessageBtn = document.getElementById('sendMessage');
    const imageUpload = document.getElementById('imageUpload');
    const actionButtons = document.querySelectorAll('.action-btn');
    const guideCards = document.querySelectorAll('.guide-card');
    const registerDonorBtn = document.getElementById('registerDonor');

    // ======================
    // Data
    // ======================
    const emergencyTips = {
        cardiac: [
            "Have the person sit down and rest",
            "Loosen any tight clothing",
            "If prescribed, help them take their nitroglycerin",
            "If unconscious, begin CPR if trained",
            "Don't let the person deny symptoms or delay seeking help"
        ],
        trauma: [
            "Apply direct pressure to stop any bleeding",
            "Don't remove any embedded objects",
            "Immobilize injured areas if possible",
            "Keep the person warm to prevent shock",
            "Monitor breathing and consciousness"
        ],
        stroke: [
            "Note the time when symptoms first appeared",
            "Have the person lie down on their side if unconscious",
            "Don't give them anything to eat or drink",
            "Loosen any tight clothing",
            "Speak calmly and reassure them"
        ],
        respiratory: [
            "Help the person sit in a comfortable position",
            "Loosen any tight clothing around the neck",
            "If asthma, help them use their inhaler",
            "Don't lay them down if having trouble breathing",
            "Monitor for changes in breathing pattern"
        ],
        other: [
            "Stay with the person and keep them calm",
            "Monitor their breathing and consciousness",
            "Don't give them anything to eat or drink",
            "Be prepared to describe symptoms to responders",
            "Gather any medications they're taking"
        ]
    };

    const hospitals = [
        {
            id: 1,
            name: "City General Hospital",
            address: "123 Medical Drive, Cityville",
            distance: "1.2 km",
            waitTime: 15,
            rating: 4.5,
            specialties: ["emergency", "cardiology", "trauma"]
        },
        {
            id: 2,
            name: "Community Medical Center",
            address: "456 Health Avenue, Townsville",
            distance: "2.8 km",
            waitTime: 45,
            rating: 3.8,
            specialties: ["emergency", "pediatrics"]
        },
        {
            id: 3,
            name: "University Teaching Hospital",
            address: "789 College Road, Academiatown",
            distance: "4.1 km",
            waitTime: 30,
            rating: 4.2,
            specialties: ["emergency", "neurology", "cardiology"]
        }
    ];

    const bloodBanks = [
        {
            id: 1,
            name: "LifeBlood Center",
            address: "123 Donor Street, Cityville",
            distance: "1.5 km",
            stocks: {
                "A+": "available",
                "A-": "low",
                "B+": "available",
                "B-": "critical",
                "AB+": "available",
                "AB-": "available",
                "O+": "low",
                "O-": "critical"
            }
        },
        {
            id: 2,
            name: "Community Blood Bank",
            address: "456 Plasma Lane, Townsville",
            distance: "3.2 km",
            stocks: {
                "A+": "available",
                "A-": "available",
                "B+": "low",
                "B-": "available",
                "AB+": "critical",
                "AB-": "low",
                "O+": "available",
                "O-": "low"
            }
        }
    ];

    const aiResponses = {
        fever: "For fever, rest and drink plenty of fluids. Take acetaminophen or ibuprofen for discomfort. Seek medical help if fever is above 103°F (39.4°C) or lasts more than 3 days.",
        headache: "For headaches, rest in a quiet, dark room. Apply a cool cloth to your forehead. Stay hydrated and consider over-the-counter pain relievers. Seek help for severe or sudden headaches.",
        rash: "For rashes, avoid scratching. Apply cool compresses and moisturizers. If severe or spreading, consult a healthcare provider. Can you upload a photo for more specific advice?",
        pain: "Chest pain can be serious. If it's severe, spreads to arms/jaw, or is accompanied by sweating/nausea, call emergency services immediately. Are you having trouble breathing?",
        burn: "For burns, cool the area with running water for 10-15 minutes. Don't use ice. Cover with a sterile bandage. Seek help for large or deep burns.",
        cut: "For cuts, apply direct pressure to stop bleeding. Clean with water, apply antibiotic ointment, and cover with a bandage. Seek help for deep or large wounds."
    };

    const firstAidGuides = {
        cpr: "CPR Steps: 1. Check responsiveness 2. Call for help 3. Open airway 4. Give 30 chest compressions 5. Give 2 rescue breaths 6. Repeat until help arrives",
        choking: "Choking: 1. Encourage coughing 2. Give 5 back blows 3. Give 5 abdominal thrusts 4. Call emergency if object isn't dislodged",
        bleeding: "Bleeding: 1. Apply direct pressure 2. Elevate injured area 3. Add more cloth if bleeding soaks through 4. Don't remove original dressing",
        stroke: "Stroke (FAST): Face drooping, Arm weakness, Speech difficulty, Time to call emergency. Note symptom onset time."
    };

    // ======================
    // Initialization
    // ======================
    function init() {
        setupNavigation();
        setupEmergencySection();
        setupHospitalFinder();
        setupAIAssistant();
        setupBloodBankFinder();
        showSection(currentSection);
    }

    // ======================
    // Navigation
    // ======================
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('href').substring(1);
                showSection(sectionId);
            });
        });
    }

    function showSection(sectionId) {
        // Hide all sections
        Object.values(sections).forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        if (sections[sectionId]) {
            sections[sectionId].classList.remove('hidden');
            currentSection = sectionId;
            
            // Update active nav link
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
            
            // Special setup for certain sections
            if (sectionId === 'hospital-finder') {
                loadHospitals();
            } else if (sectionId === 'blood-bank') {
                loadBloodBanks();
            }
        }
    }

    // ======================
    // Emergency Section
    // ======================
    function setupEmergencySection() {
        // Set emergency type
        typeButtons.forEach(button => {
            button.addEventListener('click', function() {
                emergencyType = this.dataset.type;
                
                // Update active button
                typeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update tips if SOS is already active
                if (isSOSActive) {
                    updateEmergencyTips();
                }
            });
        });
        
        // SOS button press and hold functionality
        sosButton.addEventListener('mousedown', startSOS);
        sosButton.addEventListener('touchstart', startSOS);
        
        sosButton.addEventListener('mouseup', cancelSOS);
        sosButton.addEventListener('touchend', cancelSOS);
        sosButton.addEventListener('mouseleave', cancelSOS);
        
        // Initialize with 'other' as default emergency type
        document.querySelector('.type-btn[data-type="other"]').classList.add('active');
        updateEmergencyTips();
    }

    function startSOS(e) {
        e.preventDefault();
        
        // Reset any existing timer
        if (pressTimer) clearTimeout(pressTimer);
        
        // Visual feedback
        sosButton.classList.add('active');
        
        // Set timer for 3 seconds
        pressTimer = setTimeout(activateSOS, 3000);
    }

    function cancelSOS() {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        sosButton.classList.remove('active');
    }

    function activateSOS() {
        isSOSActive = true;
        
        // Show emergency info
        emergencyInfo.classList.remove('hidden');
        
        // Update tips based on emergency type
        updateEmergencyTips();
        
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Simulate response times based on location accuracy
                    const accuracy = position.coords.accuracy || 100;
                    const ambulanceTime = Math.max(2, Math.min(10, Math.floor(accuracy / 100)));
                    const volunteerTime = Math.max(1, ambulanceTime - 1);
                    
                    document.getElementById('ambulanceTime').textContent = `${ambulanceTime}-${ambulanceTime + 2}`;
                    document.getElementById('volunteerTime').textContent = `${volunteerTime}-${volunteerTime + 2}`;
                    
                    // Load map (simulated in this demo)
                    loadMap(position.coords.latitude, position.coords.longitude);
                },
                error => {
                    console.error('Error getting location:', error);
                    // Default times if location fails
                    document.getElementById('ambulanceTime').textContent = '5-8';
                    document.getElementById('volunteerTime').textContent = '4-7';
                    
                    // Load map with default location
                    loadMap(0, 0);
                }
            );
        } else {
            console.log('Geolocation not supported');
            // Default times if geolocation not available
            document.getElementById('ambulanceTime').textContent = '5-8';
            document.getElementById('volunteerTime').textContent = '4-7';
            
            // Load map with default location
            loadMap(0, 0);
        }
    }

    function updateEmergencyTips() {
        // Clear existing tips
        emergencyTipsList.innerHTML = '';
        
        // Add tips for current emergency type
        emergencyTips[emergencyType].forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            emergencyTipsList.appendChild(li);
        });
    }

    function loadMap(lat, lng) {
        const mapElement = document.getElementById('locationMap');
        
        // In a real app, we'd use Google Maps API or similar
        // For this demo, we'll just show a placeholder
        mapElement.innerHTML = `
            <div style="height:100%; display:flex; align-items:center; justify-content:center; background:#ddd; color:#555;">
                <div style="text-align:center;">
                    <p>Map would display here with your location</p>
                    <p>Latitude: ${lat.toFixed(4)}</p>
                    <p>Longitude: ${lng.toFixed(4)}</p>
                </div>
            </div>
        `;
    }

    // ======================
    // Hospital Finder Section
    // ======================
    function setupHospitalFinder() {
        useCurrentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        locationInput.value = "Current Location";
                        loadHospitals();
                    },
                    error => {
                        alert("Unable to get your location. Please enter manually.");
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser. Please enter manually.");
            }
        });

        document.getElementById('specialtyFilter').addEventListener('change', loadHospitals);
        document.getElementById('distanceFilter').addEventListener('change', loadHospitals);

        const sortButtons = document.querySelectorAll('.sort-btn');
        sortButtons.forEach(button => {
            button.addEventListener('click', function() {
                sortButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                loadHospitals();
            });
        });
    }

    function loadHospitals() {
        const specialty = document.getElementById('specialtyFilter').value;
        const distance = parseInt(document.getElementById('distanceFilter').value);
        const sortBy = document.querySelector('.sort-btn.active').dataset.sort;

        // Filter hospitals
        let filteredHospitals = hospitals.filter(hospital => {
            // Filter by specialty if selected
            if (specialty && !hospital.specialties.includes(specialty)) {
                return false;
            }
            // Filter by distance (simplified for demo)
            const hospitalDistance = parseFloat(hospital.distance.split(' ')[0]);
            return hospitalDistance <= distance;
        });

        // Sort hospitals
        filteredHospitals.sort((a, b) => {
            if (sortBy === 'distance') {
                return parseFloat(a.distance.split(' ')[0]) - parseFloat(b.distance.split(' ')[0]);
            } else if (sortBy === 'wait') {
                return a.waitTime - b.waitTime;
            } else if (sortBy === 'rating') {
                return b.rating - a.rating;
            }
            return 0;
        });

        // Display hospitals
        hospitalList.innerHTML = '';
        filteredHospitals.forEach(hospital => {
            const waitTimeClass = hospital.waitTime < 20 ? 'low' : 
                                hospital.waitTime < 40 ? 'medium' : 'high';
            
            const hospitalCard = document.createElement('div');
            hospitalCard.className = 'hospital-card';
            hospitalCard.innerHTML = `
                <div class="hospital-info">
                    <h3>${hospital.name}</h3>
                    <p>${hospital.address}</p>
                    <p>${hospital.distance} away</p>
                </div>
                <div class="hospital-specialties">
                    <p>Specialties: ${hospital.specialties.join(', ')}</p>
                    <p>Rating: ${hospital.rating}/5</p>
                </div>
                <div class="wait-time ${waitTimeClass}">
                    ${hospital.waitTime} min wait
                </div>
            `;
            hospitalList.appendChild(hospitalCard);
        });

        // Update map (simulated)
        updateHospitalMap();
    }

    function updateHospitalMap() {
        const mapElement = document.getElementById('hospitalMap');
        
        // In a real app, we'd update the map with hospital markers
        mapElement.innerHTML = `
            <div style="height:100%; display:flex; align-items:center; justify-content:center; background:#ddd; color:#555;">
                <div style="text-align:center;">
                    <p>Map would display here with hospital locations</p>
                    ${userLocation ? `<p>Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</p>` : ''}
                </div>
            </div>
        `;
    }

    // ======================
    // AI Assistant Section
    // ======================
    function setupAIAssistant() {
        // Send message functionality
        sendMessageBtn.addEventListener('click', sendMessage);
        userMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Upload image functionality
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    addMessage('user', '', event.target.result);
                    // Simulate AI response
                    setTimeout(() => {
                        addMessage('bot', "I've analyzed the image. This appears to be a skin rash. I recommend applying a cool compress and avoiding scratching. If it worsens or spreads, consult a healthcare provider.");
                    }, 1500);
                };
                reader.readAsDataURL(file);
            }
        });

        // Quick action buttons
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const symptom = this.dataset.symptom;
                addMessage('user', `I have ${symptom}`);
                // Simulate AI response
                setTimeout(() => {
                    addMessage('bot', aiResponses[symptom]);
                }, 1000);
            });
        });

        // First aid guides
        guideCards.forEach(card => {
            card.addEventListener('click', function() {
                const guide = this.dataset.guide;
                addMessage('bot', firstAidGuides[guide]);
            });
        });
    }

    function sendMessage() {
        const message = userMessageInput.value.trim();
        if (message) {
            addMessage('user', message);
            userMessageInput.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                const response = generateAIResponse(message);
                addMessage('bot', response);
            }, 1000);
        }
    }

    function generateAIResponse(message) {
        // Simple keyword matching for demo purposes
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('fever')) {
            return aiResponses.fever;
        } else if (lowerMessage.includes('headache')) {
            return aiResponses.headache;
        } else if (lowerMessage.includes('rash') || lowerMessage.includes('skin')) {
            return aiResponses.rash;
        } else if (lowerMessage.includes('pain') || lowerMessage.includes('chest')) {
            return aiResponses.pain;
        } else if (lowerMessage.includes('burn')) {
            return aiResponses.burn;
        } else if (lowerMessage.includes('cut') || lowerMessage.includes('wound')) {
            return aiResponses.cut;
        } else {
            return "I understand you're concerned about your health. Can you provide more details about your symptoms? For serious symptoms like chest pain or difficulty breathing, please seek immediate medical attention.";
        }
    }

    function addMessage(sender, text, imageUrl = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (imageUrl) {
            messageDiv.innerHTML = `<img src="${imageUrl}" alt="Uploaded image" style="max-width:200px; max-height:200px;">`;
        } else {
            messageDiv.innerHTML = `<p>${text}</p>`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ======================
    // Blood Bank Section
    // ======================
    function setupBloodBankFinder() {
        document.getElementById('useCurrentLocationBlood').addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        document.getElementById('bloodLocationInput').value = "Current Location";
                        loadBloodBanks();
                    },
                    error => {
                        alert("Unable to get your location. Please enter manually.");
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser. Please enter manually.");
            }
        });

        document.getElementById('bloodType').addEventListener('change', loadBloodBanks);
        registerDonorBtn.addEventListener('click', registerAsDonor);
    }

    function loadBloodBanks() {
        const bloodType = document.getElementById('bloodType').value;
        
        // Filter blood banks if specific blood type is selected
        let filteredBanks = bloodBanks;
        if (bloodType !== 'all') {
            filteredBanks = bloodBanks.filter(bank => bank.stocks[bloodType] !== 'critical');
        }

        // Display blood banks
        bloodBankList.innerHTML = '';
        filteredBanks.forEach(bank => {
            const bankCard = document.createElement('div');
            bankCard.className = 'blood-bank-card';
            
            // Create stock items HTML
            let stocksHTML = '';
            if (bloodType === 'all') {
                stocksHTML = Object.entries(bank.stocks)
                    .map(([type, status]) => `
                        <div class="stock-item">
                            <span class="stock-type">${type}:</span>
                            <span class="stock-status ${status}">${status}</span>
                        </div>
                    `)
                    .join('');
            } else {
                stocksHTML = `
                    <div class="stock-item">
                        <span class="stock-type">${bloodType}:</span>
                        <span class="stock-status ${bank.stocks[bloodType]}">${bank.stocks[bloodType]}</span>
                    </div>
                `;
            }
            
            bankCard.innerHTML = `
                <div class="blood-bank-info">
                    <h3>${bank.name}</h3>
                    <p>${bank.address}</p>
                    <p>${bank.distance} away</p>
                </div>
                <div class="blood-stock">
                    ${stocksHTML}
                </div>
                <button class="btn">Request</button>
            `;
            bloodBankList.appendChild(bankCard);
        });
    }

    function registerAsDonor() {
        alert("Thank you for your interest in becoming a blood donor! In a real application, this would redirect you to a registration form.");
    }

    // ======================
    // Initialize the App
    // ======================
    init();
});