const addTaskBtn = document.getElementById("add"); 
let task = JSON.parse(localStorage.getItem("Job")) || []; // Load task from local storage or empty array

const savedExpenses = JSON.parse(localStorage.getItem("savedExpenses")) || {};
const income = parseFloat(localStorage.getItem("income")) || 0;
const totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
const monthlySalary = parseFloat(localStorage.getItem("monthlySalary")) || 0;
const career = localStorage.getItem("career") || "";

const canvas = document.getElementById("myChart");

// Create chart with initial dummy data
let currentChart = new Chart(canvas, {
    type: "doughnut",
    data: {
        labels: ["Necessities", "Extras", "Savings"],
        datasets: [{
            label: "%",
            data: [0, 0, 0], // placeholder, will update
            backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0"]
        }]
    },
    options: {
        plugins: {
            title: { display: true, text: "Expenses Breakdown" }
        }
    }
});

window.addEventListener("DOMContentLoaded", () => {
    // Load saved chart percentages from localStorage
    const savedPercentages = JSON.parse(localStorage.getItem("chartPercentages")) || [0, 0, 0];
    currentChart.data.datasets[0].data = savedPercentages;
    currentChart.update();

    // Show total savings/net income
    const totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
    const netIncomeEl = document.getElementById("netIncome");
    if (netIncomeEl) {
        netIncomeEl.textContent = `Net Income: $${totalSavings.toFixed(2)}`;
        netIncomeEl.style.color = totalSavings < 0 ? "red" : "green";
    }

    // Show selected career and monthly salary
    const savedCareer = localStorage.getItem("career") || "N/A";
    const savedSalary = parseFloat(localStorage.getItem("monthlySalary")) || 0;
    const careerEl = document.getElementById("careerDisplay");
    const salaryEl = document.getElementById("SalaryM");

    if (careerEl) careerEl.textContent = `Career: ${savedCareer}`;
    if (salaryEl) salaryEl.textContent = `$${savedSalary.toFixed(2)}`;
});

window.addEventListener("DOMContentLoaded", () => {
    // Grab percentages from localStorage
    const dataPercentages = JSON.parse(localStorage.getItem("chartPercentages")) || [0,0,0];

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

window.addEventListener("DOMContentLoaded", () =>  { //function to calculate taxes and budget based on salary, runs when page loads
    const monthlySalary = parseFloat(localStorage.getItem("monthlySalary")) || 0; // Get monthly salary from local storage or default to 0
const mediCare= monthlySalary * 0.0145; // Calculate Medicare tax
const socialSecurity = monthlySalary * 0.062; // Calculate Social Security tax
const stateTax = monthlySalary * 0.04; // Calculate state tax
const federalSmall = monthlySalary * 0.10; // Calculate federal tax for small income
const federalMedium = monthlySalary * 0.12; // Calculate federal tax for medium income
const federalLarge = monthlySalary * 0.22; // Calculate federal tax for large income
const totalDeductionSmall = mediCare + socialSecurity + stateTax + federalSmall; // Total deductions for small income
const totalDeductionMedium = mediCare + socialSecurity + stateTax + federalMedium; // Total deductions for medium income
const totalDeductionLarge = mediCare + socialSecurity + stateTax + federalLarge; // Total deductions for large income
const mBudgetSmall = (monthlySalary - totalDeductionSmall) / 12; // Monthly budget for small income
const mBudgetMedium = (monthlySalary - totalDeductionMedium) / 12; // Monthly budget for medium income
const mBudgetLarge = (monthlySalary - totalDeductionLarge) / 12; // Monthly budget for large income
localStorage.setItem("mBudgetSmall", mBudgetSmall.toFixed(2)); // Save monthly budget for small income to local storage
localStorage.setItem("mBudgetMedium", mBudgetMedium.toFixed(2)); // Save monthly budget for medium income to local storage
localStorage.setItem("mBudgetLarge", mBudgetLarge.toFixed(2)); // Save monthly budget for large income to local storage

    if (monthlySalary-16100 <= 12400) {
document.getElementById("intro").innerHTML = `Your annual salary is $${monthlySalary}, which after deducting 16.1k is ${monthlySalary-16100}, smaller than 12.4k, so starting with federal income tax(16.1k plus 10%) medicare(1.45%), social security(6.2%), and state tax(4%), taking $${totalDeductionSmall.toFixed(2)}, leaving $${(monthlySalary - totalDeductionSmall).toFixed(2)}. Now for every month you can expect to take home $${mBudgetSmall.toFixed(2)}.`;
console.log("Salary-$16,100: ", monthlySalary-16100, `is smaller than 12400`);
}

else if( monthlySalary-16100 <= 50400 && monthlySalary-16100 < 124000) {
document.getElementById("intro").innerHTML = `Your annual salary is $${monthlySalary}, which after deducting 16.1k is ${monthlySalary-16100}, between 12.4k and 50.4k, so starting with federal income tax(16.1k plus 12%) medicare(1.45%), social security(6.2%), and state tax(4%), taking $${totalDeductionMedium.toFixed(2)}, leaving $${(monthlySalary - totalDeductionMedium).toFixed(2)}. Now for every month you can expect to take home $${mBudgetMedium.toFixed(2)}.`;
console.log("Salary-$16,100: ", monthlySalary-16100, `is between 12400 and 54000`);
}

else if(monthlySalary-16100 > 50400) {
document.getElementById("intro").innerHTML = `Your annual salary is $${monthlySalary}, which after deducting 16.1k is ${monthlySalary-16100}, bigger than 50.4k, so starting with federal income tax(16.1k plus 22%) medicare(1.45%), social security(6.2%), and state tax(4%), taking $${totalDeductionLarge.toFixed(2)}, leaving $${(monthlySalary - totalDeductionLarge).toFixed(2)}. Now for every month you can expect to take home $${mBudgetLarge.toFixed(2)}.`;
console.log("Salary-$16,100: ", monthlySalary-16100, `is bigger than 54000`);
}

const monthlyBudget = {
    small: mBudgetSmall,
    medium: mBudgetMedium,
    large: mBudgetLarge
};
localStorage.setItem("monthlyBudget", JSON.stringify(monthlyBudget)); // Save monthly budget object to local storage
});

async function getCareers() { //grabbing careers
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
    const savedMonthlySalary = localStorage.getItem("monthlySalary");
    const careerSelect = document.getElementById("careerSelect");

    if (savedCareer) {
        careerSelect.value = savedCareer;
    }

    if (savedMonthlySalary) {
        const monthly = document.getElementById("SalaryM");
        monthly.innerHTML = `$${parseFloat(savedMonthlySalary).toFixed(2)}`;
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
    const monthlySalary = parseFloat(localStorage.getItem("monthlySalary")) || 0;
    const mBudgetSmall = parseFloat(localStorage.getItem("mBudgetSmall")) || 0;
    const mBudgetMedium = parseFloat(localStorage.getItem("mBudgetMedium")) || 0;
    const mBudgetLarge = parseFloat(localStorage.getItem("mBudgetLarge")) || 0;

    let monthlyBudget;
    if (monthlySalary - 16100 <= 12400) monthlyBudget = mBudgetSmall;
    else if (monthlySalary - 16100 <= 50400) monthlyBudget = mBudgetMedium;
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

    const savings = Math.max(income - totalExpenses, 0);

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
//end of function

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
careerSelect.addEventListener("change", () => {
    const selectedCareer = careerSelect.options[careerSelect.selectedIndex];
    const monthly = document.getElementById("SalaryM");
    // const selectedCareer = careerSelect.value;
    const salary = selectedCareer.dataset.salary;
    const career = selectedCareer.value
    console.log(career, " Selected Salaay: ", salary);
    const monthlySalary = salary;
    console.log(`Selected Career: ${career}, Salary: ${monthlySalary}`);
    monthly.innerHTML = `$${monthlySalary}`;
    localStorage.setItem("career", career); // Save selected career to local storage
     localStorage.setItem("monthlySalary", monthlySalary); // Save monthly salary to local storage
    calcSaveChart(); // Update the chart with the new salary
});

window.addEventListener("DOMContentLoaded", () => {
    const savedCareer = localStorage.getItem("career");  // Get saved career from local storage
    const savedMonthlySalary = localStorage.getItem("monthlySalary"); // Get saved monthly salary from local storage
    const careerSelect = document.getElementById("careerSelect"); // Get the career select element

    if (savedCareer) {
        careerSelect.value = savedCareer;
    }
    if (savedMonthlySalary) {
        const monthly = document.getElementById("SalaryM");
        monthly.innerHTML = `$${parseFloat(savedMonthlySalary)}`; // Display the saved monthly salary
    }
});

//Wise Up tip
const tipEl = document.getElementById("tips");
const actualSavings = parseFloat(localStorage.getItem("totalSavings")) || 1;
const mBudgetSmall = parseFloat(localStorage.getItem("mBudgetSmall")) || 0;
    const mBudgetMedium = parseFloat(localStorage.getItem("mBudgetMedium")) || 0;
    const mBudgetLarge = parseFloat(localStorage.getItem("mBudgetLarge")) || 0;
let currentTakeHome = 0;
    if (monthlySalary - 16100 <= 12400) currentTakeHome = mBudgetSmall;
    else if (monthlySalary - 16100 <= 50400) currentTakeHome = mBudgetMedium;
    else currentTakeHome = mBudgetLarge;

const targetThreshold = 0.30; // 30% savings threshold for tips
const savingsGoal = currentTakeHome * targetThreshold; // Calculate savings goal based on monthly budget
if (actualSavings >= savingsGoal) {
        tipEl.textContent = `Following your budget, you are above 30% of total savings. Total leftover: $${actualSavings.toFixed(2)}.`;
        tipEl.style.color = "#4BC0C0"; // Match your "Savings" chart color
    } else {
        const gap = savingsGoal - actualSavings;
        tipEl.textContent = `Following your budget, you are below 30% of total savings. You are $${gap.toFixed(2)} away from your goal. Consider cutting back on 'fun' expenses!`;
        tipEl.style.color = "#FF6384"; // Match your "Extras" chart color
    }

//Results page
window.addEventListener("load", () => {
    const canvas1 = document.getElementById("myChart");
    const canvas2 = document.getElementById("secondaryChart");
    const h1 = document.querySelector('h1');
    const isResultsPage = h1 && h1.textContent.includes("Final Results");

    if (isResultsPage) {
        let resultsChart = null; 
        let secondaryChart = null;

        const renderCharts = (chartType) => {
            const savedPercentages = JSON.parse(localStorage.getItem("chartPercentages")) || [0, 0, 100];
            
            // Primary Chart (Toggle between Bar/Pie)
            if (resultsChart) resultsChart.destroy();
            resultsChart = new Chart(canvas1, {
                type: chartType, 
                data: {
                    labels: ["Necessities", "Extras", "Savings"],
                    datasets: [{
                        label: "Current Budget %",
                        data: savedPercentages,
                        backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0"],
                    }]
                }
            });

            // Secondary Chart (Static Bar for comparison)
            if (canvas2) {
                if (secondaryChart) secondaryChart.destroy();
                secondaryChart = new Chart(canvas2, {
                    type: "bar", 
                    data: {
                        labels: ["Your Savings", "Recommended"],
                        datasets: [{
                            label: "Savings % Comparison",
                            data: [savedPercentages[2], 20], // Index 2 is Savings
                            backgroundColor: ["#4BC0C0", "#E7E9ED"]
                        }]
                    },
                    options: { scales: { y: { beginAtZero: true, max: 100 } } }
                });
            }
        };

        renderCharts("bar"); // Default to bar on load

        document.getElementById("barBtn").onclick = () => renderCharts("bar");
        document.getElementById("pieBtn").onclick = () => renderCharts("doughnut");
    }
});