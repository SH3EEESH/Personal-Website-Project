// Making lots of notes because i feel alittle iffy about javascript
// Grabbing different elements using const so these elements never change
const searchForm = document.getElementById('search-form');       // Grabs the 'search-form' from html file onto the form itself so it will refrain from refreshing the page
const searchInput = document.getElementById('search-input');     // Grabs from the 'search-input' from html file so I can read what the user input
const tierFilter = document.getElementById('tier-filter');       // Grab the 'tier-filter' from html file to manage dropdown menu so I know what category the user chose
const resultsGrid = document.getElementById('results-grid');     // Grab from the 'results-grid' from html to access empty grid so I can access the HTML cards inside it
const statusMessage = document.getElementById('status-message'); // Grabs from the 'status-message' to empty div so I can show if a response is loading or spits out an error text

// Use 'let' to start from an empty, and the information it has will be able to change
let scenariosData = [];

// Async section so javascript doesn't simply freeze the website lol
// Use async to start the function
async function setupScenariosDefaults() { // I created the name to remind me that this function focuses on when to prompt a loading or error message
    // Used the try command to allow the file to run the code, then moves down to the next step
    try {
        statusMessage.textContent = 'Loading training scenarios'; // Basically used to prompt the user what is happening while everything loads
        const response = await fetch('commands.json'); // Pause until commands.json is downloaded, named the const response, because, im waiting for a response from the checker

        if (!response.ok) { // A built in check to see if theres any problems or errors, calls the response from earlier
            throw new Error('Network error, file not found'); // Throw is like a force, if theres a major error, the error message is sent into the 'catch' block
        }

        scenariosData = await response.json();
        statusMessage.textContent = '';

        // Move downloaded data into the next function
        renderDashboard(scenariosData); // FIXED: Changed from renderUI to match the function name below
    }
    catch (error) {
        statusMessage.style.color = '#f85149'; // FIXED: Corrected the variable name, added quotes and semicolon
        // use innerHTML to access the bold mechanic from HTML
        statusMessage.innerHTML = 'Error loading scenarios, make sure to run program on a <strong>Live</strong> Server'; // Added a bold to Live so it sticks out to user
        console.error(error);
    }
}

// Drawing the actual scenario boxes in Java(script)
function renderDashboard(dataArray) { // Takes the data downloaded earlier and create the scenarios
    // Checks if the search field find nothing the user was looking for
    if (dataArray.length === 0) {
        // Print a new error message, or just a lost message
        resultsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;"> Couldnt find scenarios </p>';
        return;
    }

    // Creates placeholders to strings, which is where the html text will be presented
    let outputHTML = '';

    // Now look through and loop every item in the data / information we downloaded
    // FIXED: Cleaned up the accidental duplicate loop here
    dataArray.forEach(function(scenario) {
        // This will lead into building a block for EACH scenario, so I don't have to create a seperate one for each
        // (`) allows me to write HTML on multiple lines
        outputHTML += `
            <div>
                <h3>${scenario.title} (${scenario.tier})</h3>
                <p>${scenario.description}</p>
                
                <button id="btn-${scenario.id}">Reveal Solution</button>
                
                <div id="details-${scenario.id}" style="display: none;">
                    <p>Command: ${scenario.expected_command}</p>
                    <p>Hint: ${scenario.hint}</p>
                </div>
                <hr> 
            </div>
        `;
    });


    // 1. Actually inject the string of HTML we just built into the webpage
    resultsGrid.innerHTML = outputHTML;

    // 2. Loop through again to make the "Reveal Solution" buttons actually click
    dataArray.forEach(function(scenario) {
        const btn = document.getElementById(`btn-${scenario.id}`);
        const details = document.getElementById(`details-${scenario.id}`);

        btn.addEventListener('click', function(e) {
            // Toggle the style between hidden and block
            if (details.style.display === 'block') {
                details.style.display = 'none';
                btn.textContent = 'Reveal Solution';
            } else {
                details.style.display = 'block';
                btn.textContent = 'Hide Solution';
            }
        });
    });
}

// 1. Listen for the Search Form submission
searchForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page from reloading

    const searchTerm = searchInput.value.toLowerCase().trim();
    let filteredData = [];

    // Loop through to see if the title or description matches the search
    scenariosData.forEach(function(scenario) {
        let title = scenario.title.toLowerCase();
        let desc = scenario.description.toLowerCase();

        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
            filteredData.push(scenario); // Keep it if it matches!
        }
    });

    tierFilter.value = 'All'; // Reset dropdown to default
    renderDashboard(filteredData); // Redraw the screen with only the matching items
});

// 2. Listen for the Dropdown Menu changing
tierFilter.addEventListener('change', function(e) {
    const selectedTier = e.target.value;
    let filteredData = [];
    
    // Check if they want all of them, or a specific category
    if (selectedTier === 'All') {
        filteredData = scenariosData;
    } else {
        scenariosData.forEach(function(scenario) {
            if (scenario.tier === selectedTier) {
                filteredData.push(scenario);
            }
        });
    }

    searchInput.value = ''; // Clear search bar
    renderDashboard(filteredData); // Redraw the screen
});

// FINALLY: Run the setup function to start the whole app when the page loads!
setupScenariosDefaults();