const addTaskBtn = document.getElementById("add");
let task = JSON.parse(localStorage.getItem("Job")) || []; // Load task from local storage or empty array

window.addEventListener("DOMContentLoaded", () => {
    calculateTaxesAndBudget();
});
const savedExpenses = JSON.parse(localStorage.getItem("savedExpenses")) || {};
const income = parseFloat(localStorage.getItem("income")) || 0;
const totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
const annualSalary = parseFloat(localStorage.getItem("annualSalary")) || 0;
const career = localStorage.getItem("career") || "";

const pieBtn = document.getElementById("pieBtn"); 
const barBtn = document.getElementById("barBtn"); if(pieBtn && barBtn){};
const canvas = document.getElementById("myChart");


if(barBtn) {
    barBtn.addEventListener("click", () => {
        if (!currentChart) return;

        // Change the chart type
        currentChart.config.type = "bar";
        
        // Grab the data that was already calculated and saved by calcSaveChart
        const savedPercentages = JSON.parse(localStorage.getItem("chartPercentages")) || [0, 0, 0];
        currentChart.data.datasets[0].data = savedPercentages;
        currentChart.data.datasets[0].label = "%";
        currentChart.data.labels = ["Necessities", "Fun", "Savings"];
        currentChart.options.scales = {
            y: { 
                beginAtZero: true, 
                title: { display: true, 
                    text: "Percentage (%)" } },
            x: { title: { 
                display: true, 
                text: "Money Allocation" } }
        };

        currentChart.update();
        
        //Saves bar Chart Type
        localStorage.setItem("selectedChartType", "bar");
    });
};

if(pieBtn) {
    pieBtn.addEventListener("click", () => {
        if (!currentChart) return;
        currentChart.config.type = "doughnut";
        currentChart.options.scales = {};
        currentChart.update();
        localStorage.setItem("selectedChartType", "doughnut");
    });
}

let currentChart = null;
const savedType = localStorage.getItem("selectedChartType") || "doughnut";
if (canvas) {
    currentChart = new Chart(canvas, {
        type: savedType,
        data: {
            labels: ["Necessities", "Extras", "Savings"],
            datasets: [{
                label: "%",
                data: [0, 0, 0], 
                backgroundColor: ["#007BFF", "#FF0000", "#16A300"]
            }]
        },
        options: {
responsive: true,
maintainAspectRatio: false,
            scales: savedType === "bar" ? {
                y: { 
                    beginAtZero: true, 
                    title: { 
                        display: true, 
                        text: "Percentage (%)" } },
                x: { 
                    title: { 
                        display: true, 
                        text: "Money Allocation" } }
            } : {},
            plugins: {
                title: { display: true, text: "Expenses Breakdown" }
            }
        }
    });
}

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

window.addEventListener("DOMContentLoaded", () => {

    const introEl = document.getElementById("intro");
    const annualSalary = parseFloat(localStorage.getItem("annualSalary")) || 0;

    const STANDARD_DEDUCTION = 16100;

    // Taxable income
    let taxableIncome = annualSalary - STANDARD_DEDUCTION;
    if (taxableIncome < 0) taxableIncome = 0;

    // Payroll taxes
    const medicare = annualSalary * 0.0145;
    const socialSecurity = annualSalary * 0.062;
    const stateTax = annualSalary * 0.04;

    // Progressive Federal Tax
    let federalTax = 0;

    if (taxableIncome <= 12400) {
        federalTax = taxableIncome * 0.10;
    }
    else if (taxableIncome <= 50400) {
        federalTax =
            (12400 * 0.10) +
            ((taxableIncome - 12400) * 0.12);
    }
    else {
        federalTax =
            (12400 * 0.10) +
            ((50400 - 12400) * 0.12) +
            ((taxableIncome - 50400) * 0.22);
    }

    const totalTaxes = medicare + socialSecurity + stateTax + federalTax;

    const netAnnual = annualSalary - totalTaxes;
    const monthlyBudget = netAnnual / 12;

    // Save values your chart already expects
    localStorage.setItem("monthlyBudget", monthlyBudget.toFixed(2));
    localStorage.setItem("income", monthlyBudget.toFixed(2));

    if (introEl) {
        introEl.innerHTML =
            `Your annual salary is $${annualSalary.toLocaleString()}.
           Your taxable income is $${taxableIncome.toLocaleString()} after the $16,100 standard deduction,and
            your total taxes inclue Medicare(1.45%), Social Security(6.2%), State(4%), and federal, which taxes $${totalTaxes.toFixed(2)}.
            From this, the monthly take home pay is <b>$${monthlyBudget.toFixed(2)}</b>.`;
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

function calculateTaxesAndBudget(){

    const annualSalary = parseFloat(localStorage.getItem("annualSalary")) || 0;

    const STANDARD_DEDUCTION = 16100;

    let taxableIncome = annualSalary - STANDARD_DEDUCTION;
    if (taxableIncome < 0) taxableIncome = 0;

    const medicare = annualSalary * 0.0145;
    const socialSecurity = annualSalary * 0.062;
    const stateTax = annualSalary * 0.04;

    let federalTax = 0;

    if (taxableIncome <= 12400) {
        federalTax = taxableIncome * 0.10;
    }
    else if (taxableIncome <= 50400) {
        federalTax =
            (12400 * 0.10) +
            ((taxableIncome - 12400) * 0.12);
    }
    else {
        federalTax =
            (12400 * 0.10) +
            ((50400 - 12400) * 0.12) +
            ((taxableIncome - 50400) * 0.22);
    }

    const totalTaxes = medicare + socialSecurity + stateTax + federalTax;

    const netAnnual = annualSalary - totalTaxes;
    const monthlyBudget = netAnnual / 12;

    localStorage.setItem("monthlyBudget", monthlyBudget);
    localStorage.setItem("income", monthlyBudget);

}

//Expenses chart
function calcSaveChart() {
const tipEl = document.querySelector("h2.tip");
    const inputs = document.querySelectorAll(".budget");

    // Stop if not on expense page
    if (inputs.length === 0) return;

    const income = parseFloat(localStorage.getItem("monthlyBudget")) || 0;

    const savedExpenses = JSON.parse(localStorage.getItem("savedExpenses")) || {};

    let necessities = 0;
    let fun = 0;
    let totalExpenses = 0;

    inputs.forEach(input => {

        const value = parseFloat(input.value) || 0;

        savedExpenses[input.id] = value;

        totalExpenses += value;

        if (input.classList.contains("necessities")) {
            necessities += value;
        } 
        else if (input.classList.contains("fun")) {
            fun += value;
        }

    });

    const savings = income - totalExpenses;
const remainingPercentage = savings / income;
if (tipEl) {
        tipEl.style.display = "block";
        if (remainingPercentage >= 0.30) {
            tipEl.innerHTML = "Following your budget, you are <span style='color: #16A300;'>above</span> 30% of total savings.</span> It seems you know how to budget yourself wisely! Just make sure not to overindulge in fun stuff and possibly set an emergency fund in case of accidents. Either way, nice job planning for your future!";
        } else {
            tipEl.innerHTML = "Following your budget, you are <span style='color: #FF0000;'>below</span> 30% of total savings. To help relieve this, consider removing certain fun expenses like traveling, eating out, or maybe your hobby if it’s expensive. That can help you save more money and not just stay out of debt, but also earn some more money along the way!";
        }
    }

    const totalForChart = necessities + fun + savings || 1;

    const dataPercentages = [
        (necessities / totalForChart) * 100,
        (fun / totalForChart) * 100,
        (savings / totalForChart) * 100
    ];

    if (currentChart) {
        currentChart.data.datasets[0].data = dataPercentages;
        currentChart.update();
    }

    const netIncomeEl = document.getElementById("netIncome");

    if (netIncomeEl) {
        netIncomeEl.textContent = `Net Income: $${savings.toFixed(2)}`;
        netIncomeEl.style.color = savings < 0 ? "red" : "green";
    }

    localStorage.setItem("savings", savings.toFixed(2));
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

     calculateTaxesAndBudget();
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