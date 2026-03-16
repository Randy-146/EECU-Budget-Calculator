const addTaskBtn = document.getElementById("add");
let task = JSON.parse(localStorage.getItem("Job")) || []; // Load task from local storage or empty array

const savedExpenses = JSON.parse(localStorage.getItem("savedExpenses")) || {};
const income = parseFloat(localStorage.getItem("income")) || 0;
const totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
const annualSalary = parseFloat(localStorage.getItem("annualSalary")) || 0;
const career = localStorage.getItem("career") || "";

const canvas = document.getElementById("myChart");
let currentChart = null;
// Create chart with initial dummy data
if (canvas) {
    currentChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Necessities", "Extras", "Savings"],
            datasets: [{
                label: "%",
                data: [0, 0, 0], // placeholder, will update
                backgroundColor: ["#007BFF", "#FF0000", "#16A300"]
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: "Expenses Breakdown" }
            }
        }
    })
};

window.addEventListener("DOMContentLoaded", () => {
    // Load saved chart percentages from localStorage
    if (canvas) {
        const savedPercentages = JSON.parse(localStorage.getItem("chartPercentages")) || [0, 0, 0];
        currentChart.data.datasets[0].data = savedPercentages;
        currentChart.update();
    }

    // Show total savings/net income
    const totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
    const netIncomeEl = document.getElementById("netIncome");
    if (netIncomeEl) {
        netIncomeEl.textContent = `Net Income: $${totalSavings.toFixed(2)}`;
        netIncomeEl.style.color = totalSavings < 0 ? "red" : "green";
    }

    // Show selected career and monthly salary
    const savedCareer = localStorage.getItem("career") || "N/A";
    const savedSalary = parseFloat(localStorage.getItem("annualSalary")) || 0;
    const careerEl = document.getElementById("careerDisplay");
    const salaryEl = document.getElementById("SalaryM");

    if (careerEl) careerEl.textContent = `Career: ${savedCareer}`;
    if (salaryEl) salaryEl.textContent = `$${savedSalary.toFixed(2)}`;
});

window.addEventListener("DOMContentLoaded", () => {
    // Grab percentages from localStorage
    if (canvas) {
        const dataPercentages = JSON.parse(localStorage.getItem("chartPercentages")) || [0, 0, 0];

        // Update chart
        currentChart.data.datasets[0].data = dataPercentages;
        currentChart.update();

        // Optional: show net income/savings
        const totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
        const netIncomeEl = document.getElementById("netIncome");
        if (netIncomeEl) {
            netIncomeEl.textContent = `Net Income: $${totalSavings.toFixed(2)}`;
            netIncomeEl.style.color = totalSavings < 0 ? "red" : "green";
        }
    }
});

async function getSalary(career) //get career salary from API
{
    try {
        const response = await fetch(`https://eecu-data-server.vercel.app/data${career}`); //Fetch salary data from API
        const data = await response.json(); //Parse the response as JSON
        return data.results[0].salary_min || 0; // Return minimum salary or 0 if not available
    } catch (error) { // Handle any errors that occur during the fetch operation
        console.error("Error fetching salary:", error); // Log the error to the console for debugging purposes
        return 0; // Return 0 in case of error
    }
}

window.addEventListener("DOMContentLoaded", () => { //function to calculate taxes and budget based on salary, runs when page loads
    const introEl = document.getElementById("intro");
    if (introEl) {
        const annualSalary = parseFloat(localStorage.getItem("annualSalary")) || 0; // Get monthly salary from local storage or default to 0
        const mediCare = annualSalary * 0.0145; // Calculate Medicare tax
        const socialSecurity = annualSalary * 0.062; // Calculate Social Security tax
        const stateTax = annualSalary * 0.04; // Calculate state tax
        const federalSmall = annualSalary * 0.10; // Calculate federal tax for small income
        const federalMedium = annualSalary * 0.12; // Calculate federal tax for medium income
        const federalLarge = annualSalary * 0.22; // Calculate federal tax for large income
        const totalDeductionSmall = mediCare + socialSecurity + stateTax + federalSmall; // Total deductions for small income
        const totalDeductionMedium = mediCare + socialSecurity + stateTax + federalMedium; // Total deductions for medium income
        const totalDeductionLarge = mediCare + socialSecurity + stateTax + federalLarge; // Total deductions for large income
        const mBudgetSmall = (annualSalary - totalDeductionSmall) / 12; // Monthly budget for small income
        const mBudgetMedium = (annualSalary - totalDeductionMedium) / 12; // Monthly budget for medium income
        const mBudgetLarge = (annualSalary - totalDeductionLarge) / 12; // Monthly budget for large income
        localStorage.setItem("mBudgetSmall", mBudgetSmall.toFixed(2)); // Save monthly budget for small income to local storage
        localStorage.setItem("mBudgetMedium", mBudgetMedium.toFixed(2)); // Save monthly budget for medium income to local storage
        localStorage.setItem("mBudgetLarge", mBudgetLarge.toFixed(2)); // Save monthly budget for large income to local storage

        if (annualSalary - 16100 <= 12400) {
            document.getElementById("intro").innerHTML = `Your annual salary is $${annualSalary}, which after deducting 16.1k is ${annualSalary - 16100}, smaller than 12.4k, so starting with federal income tax(16.1k plus 10%) medicare(1.45%), social security(6.2%), and state tax(4%), taking $${totalDeductionSmall.toFixed(2)}, leaving $${(annualSalary - totalDeductionSmall).toFixed(2)}. Now for every month you can expect to take home $${mBudgetSmall.toFixed(2)}.`;
            console.log("Salary-$16,100: ", annualSalary - 16100, `is smaller than 12400`);
        }

        else if (annualSalary - 16100 <= 50400 && annualSalary - 16100 < 124000) {
            document.getElementById("intro").innerHTML = `Your annual salary is $${annualSalary}, which after deducting 16.1k is ${annualSalary - 16100}, between 12.4k and 50.4k, so starting with federal income tax(16.1k plus 12%) medicare(1.45%), social security(6.2%), and state tax(4%), taking $${totalDeductionMedium.toFixed(2)}, leaving $${(annualSalary - totalDeductionMedium).toFixed(2)}. Now for every month you can expect to take home $${mBudgetMedium.toFixed(2)}.`;
            console.log("Salary-$16,100: ", annualSalary - 16100, `is between 12400 and 54000`);
        }

        else if (annualSalary - 16100 > 50400) {
            document.getElementById("intro").innerHTML = `Your annual salary is $${annualSalary}, which after deducting 16.1k is ${annualSalary - 16100}, bigger than 50.4k, so starting with federal income tax(16.1k plus 22%) medicare(1.45%), social security(6.2%), and state tax(4%), taking $${totalDeductionLarge.toFixed(2)}, leaving $${(annualSalary - totalDeductionLarge).toFixed(2)}. Now for every month you can expect to take home $${mBudgetLarge.toFixed(2)}.`;
            console.log("Salary-$16,100: ", annualSalary - 16100, `is bigger than 54000`);
        }

        const monthlyBudget = {
            small: mBudgetSmall,
            medium: mBudgetMedium,
            large: mBudgetLarge
        };
        localStorage.setItem("monthlyBudget", JSON.stringify(monthlyBudget)); // Save monthly budget object to local storage
    }
});

async function getCareers() { //grabbing careers
    const dropdown = document.getElementById(`careerSelect`);
    if (!dropdown) return;
    const url = "https://eecu-data-server.vercel.app/data";
    try {
        const response = await fetch(url); //grabbing url
        const jobs = await response.json();
        createoptions(jobs); //creating options on dropdown
        restoreCareer();
        return jobs;
    }
    catch (error) {
        console.error("Error fetching careers data:", error);
        return [];
    }
}

function restoreCareer() {
    const savedCareer = localStorage.getItem("career");
    const savedAnnual = localStorage.getItem("annualSalary");
    const careerSelect = document.getElementById("careerSelect");

    if (savedCareer && careerSelect) {
        careerSelect.value = savedCareer;
    }

    if (savedAnnual) {
        const salaryDisplay = document.getElementById("SalaryA");
        if (salaryDisplay) {
            salaryDisplay.innerHTML = `$${parseFloat(savedAnnual).toLocaleString()}`;
        }
    }
}

function createoptions(careers) { //creating options for dropdown
    careers.forEach((career, index) => {
        const option = document.createElement("option");
        const dropdown = document.getElementById("careerSelect");
        // console.log(`Selected Career: ${career.Occupation}, Salary: ${career.Salary}`);
        option.innerText = `${career.Occupation}: ${career.Salary}`;
        option.value = career.Occupation;
        option.setAttribute("id", `${index}`);
        option.dataset.salary = career.Salary;
        option.addEventListener("click", () => { //possibly edit to find when user clicks dropdown and figure out which option
            careerTitle.innerHTML = `Future Career: ${career.Occupation}`;
        });
        dropdown.appendChild(option);
    });
}

getCareers();


//Expenses chart
function calcSaveChart() {
    const inputs = document.querySelectorAll(".budget");
    // GUARD: If we aren't on the expenses page (no inputs), don't recalculate!
    if (inputs.length === 0) return;
    const annualSalary = parseFloat(localStorage.getItem("annualSalary")) || 0;
    const mBudgetSmall = parseFloat(localStorage.getItem("mBudgetSmall")) || 0;
    const mBudgetMedium = parseFloat(localStorage.getItem("mBudgetMedium")) || 0;
    const mBudgetLarge = parseFloat(localStorage.getItem("mBudgetLarge")) || 0;

    let monthlyBudget;
    if (annualSalary - 16100 <= 12400) monthlyBudget = mBudgetSmall;
    else if (annualSalary - 16100 <= 50400) monthlyBudget = mBudgetMedium;
    else monthlyBudget = mBudgetLarge;

    const income = monthlyBudget; // Monthly take-home
    const savedExpenses = JSON.parse(localStorage.getItem("savedExpenses")) || {}; // load existing

    let necessities = 0;
    let fun = 0;
    let totalExpenses = 0;

    inputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        savedExpenses[input.id] = value; // update local storage without resetting everything
        totalExpenses += value;

        if (input.classList.contains("necessities")) necessities += value;
        else if (input.classList.contains("fun")) fun += value;
    });

    const savings = income - totalExpenses;

    const totalForChart = necessities + fun + savings || 1;
    const dataPercentages = [
        (necessities / totalForChart) * 100,
        (fun / totalForChart) * 100,
        (savings / totalForChart) * 100
    ];

    currentChart.data.datasets[0].data = dataPercentages;
    currentChart.update();

    const netIncomeEl = document.getElementById("netIncome");
    if (netIncomeEl) {
        netIncomeEl.textContent = `Net Income: $${savings.toFixed(2)}`;
        netIncomeEl.style.color = savings < 0 ? "red" : "green";
    }

    localStorage.setItem("savings", savings.toFixed(2));
    localStorage.setItem("monthlyBudget", monthlyBudget.toFixed(2));
    localStorage.setItem("savedExpenses", JSON.stringify(savedExpenses));
    localStorage.setItem("income", income);
    localStorage.setItem("totalSavings", savings);
    localStorage.setItem("chartPercentages", JSON.stringify(dataPercentages));
}

save();

function save() {
    const inputs = document.querySelectorAll(".budget");
    const savedExpenses = JSON.parse(localStorage.getItem("savedExpenses")) || {};

    inputs.forEach(input => {
        if (savedExpenses[input.id] !== undefined) {
            input.value = savedExpenses[input.id];
        }
    });

    // Update the chart after restoring inputs
    calcSaveChart();
    document.querySelectorAll(".budget").forEach(input => {
        input.addEventListener("input", calcSaveChart);
    });
}

window.addEventListener("DOMContentLoaded", save);


//obtain yearly salary from dropdown and convert to monthly salary, then update chart based on that
const careerSelect = document.getElementById("careerSelect");
if (careerSelect) {
    careerSelect.addEventListener("change", () => {
        const selectedOption = careerSelect.options[careerSelect.selectedIndex];
        const salaryDisplay = document.getElementById("SalaryA");
        
        const annualSalary = parseFloat(selectedOption.dataset.salary) || 0;
        const career = selectedOption.value;

        // Update Display (Show annual)
        salaryDisplay.innerHTML = `$${annualSalary.toLocaleString()}`;

        // Save to LocalStorage
        localStorage.setItem("career", career); 
        localStorage.setItem("annualSalary", annualSalary); // Changed name for clarity
        
        // Also save as annualSalary for your other functions to use
        localStorage.setItem("annualSalary", annualSalary); 

        calcSaveChart(); 
    });
}
window.addEventListener("DOMContentLoaded", () => {
    const savedCareer = localStorage.getItem("career");  // Get saved career from local storage
    const savedannualSalary = localStorage.getItem("annualSalary"); // Get saved monthly salary from local storage
    const careerSelect = document.getElementById("careerSelect"); // Get the career select element

    if (savedCareer && careerSelect) {
        careerSelect.value = savedCareer;
    }
    if (savedannualSalary && careerSelect) {
        const monthly = document.getElementById("SalaryA");
        monthly.innerHTML = `$${parseFloat(savedannualSalary)}`; // Display the saved salary
    }
});