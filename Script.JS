const addTaskBtn = document.getElementById("add"); 
let task = JSON.parse(localStorage.getItem("Job")) || []; // Load task from local storage or empty array

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


function addTaskToList() {
    document.getElementById("add-cont").innerHTML = "<input type='number' class='new' id='new-expense'>";
    console.log('works');

}


async function getCareers() { //grabbing careers
    const url = "https://eecu-data-server.vercel.app/data";
    try {
        const response = await fetch(url); //grabbing url
        const jobs = await response.json();
        createoptions(jobs); //creating options on dropdown
        return jobs;
    }
    catch (error) {
        console.error("Error fetching careers data:", error);
        return [];
    }
}

function createoptions(careers) { //creating options for dropdown
    careers.forEach((career, index) => {
        const option = document.createElement("option");
        const dropdown = document.getElementById("careerSelect");
        console.log(`Selected Career: ${career.Occupation}, Salary: ${career.Salary}`);
        option.innerHTML = `${career.Occupation}: ${career.Salary}`;
        option.setAttribute("id", `${index}`);
        option.addEventListener("click", () => { //possibly edit to find when user clicks dropdown and figure out which option
            careerTitle.innerHTML = `Future Career: ${career.Occupation}`;
        });
        dropdown.appendChild(option);
    });
}

getCareers();

const inputs = document.querySelectorAll(".budget"); //grabbing input fields
const canvas = document.getElementById("myChart"); //accessing chart

let currentChart = new Chart(canvas, //generating inital chart
    {
        type: "doughnut",
        data: {
            labels: ["Necessities(%)", "Extras(%)", "Savings(%)"],
            datasets: [{ label: "$", data: [0, 1, 0] }]
        },
        options: {
            plugins: {
                title: { display: true, text: `Expenses by category` }
            }
        }
    }
)

function calcSaveChart() {
    const savedExpenses = {}; //array for saved inputs
    let necessities = 0;
    let fun = 0;
    let savings = 0;
    let income = 100; //placeholder for income, change based off income of career chosen

    let total = 0;
    inputs.forEach(input => {
        total += Number(input.value.replace(/[^0-9]/g, '')) || 0; //adding up total

        let cleanString = input.value.replace(/[^0-9]/g, '');
        let inputValue = Number(cleanString) || 0;

        savedExpenses[input.id] = cleanString; //saving to array
        if (input.classList.contains("necessities")) {
            necessities += inputValue; //adding
        }
        else if (input.classList.contains("fun")) {
            fun += inputValue;
        }
    });
    
    savings = income - total; //savings
    localStorage.setItem("savedExpenses", JSON.stringify(savedExpenses));
    if (currentChart) currentChart.destroy();
    currentChart = new Chart(canvas, //new chart
        {
            type: "doughnut", 
            data: {
                labels: ["Necessities(%)", "Extras(%)", "Savings(%)"],
                datasets: [{ label: "$", data: [necessities, fun, savings] }]
            },
            options: {
                plugins: {
                    title: { display: true, text: `Expenses by category` }
                }
            }
        }
    )
}

function save() {
    const pullExpenses = JSON.parse(localStorage.getItem("savedExpenses")); //grabbing array
    inputs.forEach(input => { //autofilling inputs based off previous data
        if (pullExpenses) {
            if (pullExpenses[input.id] !== undefined) {
                input.value = pullExpenses[input.id]
            }
        }
        calcSaveChart(); //generate
    })
}
document.body.addEventListener("input", () => { //update on any input
    calcSaveChart();
    console.log("Hello World");

})

save();

//obtain yearly salary from dropdown and convert to monthly salary, then update chart based on that
const careerSelect = document.getElementById("careerSelect");
careerSelect.addEventListener("change", async () => {
    const selectedCareer = careerSelect.value;
    const salary = await getSalary(selectedCareer);
    const monthlySalary = salary / 12; // Convert yearly salary to monthly
    console.log(`Selected Career: ${selectedCareer}, Monthly Salary: ${monthlySalary}`);
    calcSaveChart(); // Update the chart with the new salary
});

//display onto monthly salary on page
const monthly = document.getElementById("SalaryM");
careerSelect.addEventListener("change", async () => {
    const selectedCareer = careerSelect.value;
    const salary = await getSalary(selectedCareer);
    const monthlySalary = salary / 12; // Convert yearly salary to monthly
    monthly.innerHTML = `Monthly Salary: $${monthlySalary.toFixed(2)}`;
});



//calculates tax for expenses page
function calculateTax() {
document.getElementById("intro");
const income = 30000;
const mediCare= 1 -(98.55/100);
const socialSecurity= 1 - (93.8/100);
const stateTax= 1 - (96/100);
const taxDeduct= income-16100;

if (taxDeduct < 12400 ) {
let total= taxDeduct - (1-(10/100));
}
if else(taxDeduct < 50400 & taxDeduct > 12401) {
    let total= taxDeduct - (1- (12/100));
}

else {
    let total = taxDeduct - (1- (22/100));
}
};