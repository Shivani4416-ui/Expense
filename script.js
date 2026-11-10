let transactions =
    JSON.parse(localStorage.getItem("expensifyTransactions")) || [];


const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const transactionCount = document.getElementById("transactionCount");

const recentTransactions =
    document.getElementById("recentTransactions");

const allTransactions =
    document.getElementById("allTransactions");

const form =
    document.getElementById("transactionForm");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const typeFilter =
    document.getElementById("typeFilter");

const sortFilter =
    document.getElementById("sortFilter");

const themeToggle =
    document.getElementById("themeToggle");

const settingsTheme =
    document.getElementById("settingsTheme");

const currentDate =
    document.getElementById("currentDate");

const transactionDate =
    document.getElementById("transactionDate");


let monthlyChart = null;
let categoryChart = null;
let analyticsCategoryChart = null;


const pageInfo = {

    dashboard: {
        title: "Dashboard",
        subtitle: "Overview of your finances"
    },

    transactions: {
        title: "Transactions",
        subtitle: "Manage all your income and expenses"
    },

    add: {
        title: "Add Transaction",
        subtitle: "Record your income or expense"
    },

    analytics: {
        title: "Analytics",
        subtitle: "Understand your spending habits"
    },

    settings: {
        title: "Settings",
        subtitle: "Manage your application"
    }

};


navItems.forEach(item => {

    item.addEventListener("click", () => {

        const page = item.dataset.page;

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        pages.forEach(p => {
            p.classList.remove("active-page");
        });

        document.getElementById(page)
            .classList.add("active-page");

        pageTitle.textContent =
            pageInfo[page].title;

        pageSubtitle.textContent =
            pageInfo[page].subtitle;

        if (page === "analytics") {
            updateAnalytics();
        }

    });

});


function setCurrentDate() {

    const now = new Date();

    currentDate.textContent =
        now.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric"
        });

    transactionDate.value =
        now.toISOString().split("T")[0];
}

setCurrentDate();


function formatMoney(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);

}


function saveTransactions() {

    localStorage.setItem(
        "expensifyTransactions",
        JSON.stringify(transactions)
    );

}


form.addEventListener("submit", function(e) {

    e.preventDefault();

    const text =
        document.getElementById("transactionText").value.trim();

    const amount =
        Number(
            document.getElementById("transactionAmount").value
        );

    const category =
        document.getElementById("transactionCategory").value;

    const date =
        document.getElementById("transactionDate").value;

    const type =
        document.querySelector(
            'input[name="transactionType"]:checked'
        ).value;


    if (!text || !amount || amount <= 0 || !date) {

        alert("Please enter valid transaction details.");

        return;
    }


    const transaction = {

        id: Date.now(),

        text: text,

        amount: amount,

        category: category,

        date: date,

        type: type

    };


    transactions.push(transaction);

    saveTransactions();

    form.reset();

    document.querySelector(
        'input[name="transactionType"][value="income"]'
    ).checked = true;

    setCurrentDate();

    updateEverything();

    alert("Transaction added successfully!");


    document.querySelector(
        '[data-page="dashboard"]'
    ).click();

});


function deleteTransaction(id) {

    const confirmDelete =
        confirm("Delete this transaction?");

    if (!confirmDelete) return;

    transactions =
        transactions.filter(t => t.id !== id);

    saveTransactions();

    updateEverything();

}


function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {

        if (t.type === "income") {
            income += t.amount;
        } else {
            expense += t.amount;
        }

    });

    const balance = income - expense;

    totalIncome.textContent =
        formatMoney(income);

    totalExpense.textContent =
        formatMoney(expense);

    totalBalance.textContent =
        formatMoney(balance);

    transactionCount.textContent =
        transactions.length;

}


function getCategoryIcon(category) {

    const icons = {

        Food: "fa-utensils",

        Shopping: "fa-bag-shopping",

        Transport: "fa-car",

        Bills: "fa-file-invoice",

        Entertainment: "fa-film",

        Health: "fa-heart-pulse",

        Education: "fa-graduation-cap",

        Salary: "fa-money-bill",

        Other: "fa-box"

    };

    return icons[category] || "fa-box";

}


function transactionHTML(t) {

    const sign =
        t.type === "income" ? "+" : "-";

    const amountClass =
        t.type === "income" ? "income" : "expense";

    const date =
        new Date(t.date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );


    return `

        <div class="transaction-row">

            <div class="transaction-left">

                <div class="transaction-icon">

                    <i class="fa-solid ${getCategoryIcon(t.category)}"></i>

                </div>

                <div>

                    <div class="transaction-name">
                        ${escapeHTML(t.text)}
                    </div>

                    <div class="transaction-meta">
                        ${escapeHTML(t.category)} • ${date}
                    </div>

                </div>

            </div>


            <div class="transaction-actions">

                <div class="transaction-amount ${amountClass}">
                    ${sign} ${formatMoney(t.amount)}
                </div>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${t.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function updateRecentTransactions() {

    if (transactions.length === 0) {

        recentTransactions.innerHTML = `
            <div class="empty">
                No transactions yet.
            </div>
        `;

        return;
    }


    const recent =
        [...transactions]
        .sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        )
        .slice(0, 5);


    recentTransactions.innerHTML =
        recent.map(transactionHTML).join("");

}


function updateTransactionList() {

    const search =
        searchInput.value.toLowerCase().trim();

    const category =
        categoryFilter.value;

    const type =
        typeFilter.value;

    const sort =
        sortFilter.value;


    let filtered =
        transactions.filter(t => {

            const matchesSearch =
                t.text.toLowerCase()
                .includes(search) ||

                t.category.toLowerCase()
                .includes(search);


            const matchesCategory =
                category === "all" ||
                t.category === category;


            const matchesType =
                type === "all" ||
                t.type === type;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesType
            );

        });


    /* SORT */

    if (sort === "newest") {

        filtered.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

    }

    if (sort === "oldest") {

        filtered.sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );

    }

    if (sort === "high") {

        filtered.sort(
            (a, b) =>
                b.amount - a.amount
        );

    }

    if (sort === "low") {

        filtered.sort(
            (a, b) =>
                a.amount - b.amount
        );

    }


    if (filtered.length === 0) {

        allTransactions.innerHTML = `
            <div class="empty">
                No transactions found.
            </div>
        `;

        return;
    }


    allTransactions.innerHTML =
        filtered.map(transactionHTML).join("");

}


/* FILTER EVENTS */

searchInput.addEventListener(
    "input",
    updateTransactionList
);

categoryFilter.addEventListener(
    "change",
    updateTransactionList
);

typeFilter.addEventListener(
    "change",
    updateTransactionList
);

sortFilter.addEventListener(
    "change",
    updateTransactionList
);


function createMonthlyChart() {

    const ctx =
        document
        .getElementById("monthlyChart")
        .getContext("2d");


    if (monthlyChart) {
        monthlyChart.destroy();
    }


    const selectedYear =
        Number(
            document.getElementById("yearSelect").value
        );


    const incomeData =
        new Array(12).fill(0);

    const expenseData =
        new Array(12).fill(0);


    transactions.forEach(t => {

        const date =
            new Date(t.date);

        if (date.getFullYear() !== selectedYear) {
            return;
        }

        const month =
            date.getMonth();


        if (t.type === "income") {
            incomeData[month] += t.amount;
        } else {
            expenseData[month] += t.amount;
        }

    });


    monthlyChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec"
                ],

                datasets: [

                    {
                        label: "Income",

                        data: incomeData,

                        backgroundColor: "#00d7a7",

                        borderRadius: 5,

                        barThickness: 13
                    },

                    {
                        label: "Expenses",

                        data: expenseData,

                        backgroundColor: "#ff4d72",

                        borderRadius: 5,

                        barThickness: 13
                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    duration: 500
                },

                plugins: {

                    legend: {
                        position: "bottom",

                        labels: {
                            color: getComputedStyle(document.body)
                                .getPropertyValue("--muted"),

                            boxWidth: 12,

                            font: {
                                size: 10
                            }
                        }
                    },

                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return (
                                    context.dataset.label +
                                    ": " +
                                    formatMoney(context.raw)
                                );

                            }

                        }

                    }

                },


                scales: {

                    x: {

                        grid: {
                            color: getComputedStyle(document.body)
                                .getPropertyValue("--border")
                        },

                        ticks: {
                            color: getComputedStyle(document.body)
                                .getPropertyValue("--muted"),

                            font: {
                                size: 9
                            }
                        }

                    },


                    y: {

                        beginAtZero: true,

                        grid: {
                            color: getComputedStyle(document.body)
                                .getPropertyValue("--border")
                        },

                        ticks: {

                            color: getComputedStyle(document.body)
                                .getPropertyValue("--muted"),

                            font: {
                                size: 9
                            },

                            callback: function(value) {

                                if (value >= 100000) {
                                    return "₹" +
                                        (value / 100000)
                                        .toFixed(1) +
                                        "L";
                                }

                                if (value >= 1000) {
                                    return "₹" +
                                        (value / 1000)
                                        .toFixed(0) +
                                        "K";
                                }

                                return "₹" + value;

                            }

                        }

                    }

                }

            }

        });

}


document
    .getElementById("yearSelect")
    .addEventListener(
        "change",
        createMonthlyChart
    );


function getCategoryData() {

    const categories = {};

    transactions.forEach(t => {

        if (t.type !== "expense") return;

        if (!categories[t.category]) {
            categories[t.category] = 0;
        }

        categories[t.category] += t.amount;

    });

    return categories;

}


function createCategoryChart() {

    const data =
        getCategoryData();

    const labels =
        Object.keys(data);

    const values =
        Object.values(data);


    const ctx =
        document
        .getElementById("categoryChart")
        .getContext("2d");


    if (categoryChart) {
        categoryChart.destroy();
    }


    if (labels.length === 0) {

        document.getElementById(
            "categoryTotal"
        ).textContent = "₹0.00";

        categoryChart =
            new Chart(ctx, {

                type: "doughnut",

                data: {
                    labels: ["No expenses"],

                    datasets: [{
                        data: [1],
                        backgroundColor: ["#28344c"],
                        borderWidth: 0
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "72%",
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }

            });

        document.getElementById(
            "categoryLegend"
        ).innerHTML = "";

        return;
    }


    const total =
        values.reduce(
            (sum, value) => sum + value,
            0
        );


    document.getElementById(
        "categoryTotal"
    ).textContent =
        formatMoney(total);


    const colors = [
        "#7957ff",
        "#388cff",
        "#00d7a7",
        "#ff4d72",
        "#ffb84d",
        "#e66cff",
        "#36c2ce",
        "#8e9cff",
        "#ff7b54"
    ];


    categoryChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    backgroundColor:
                        colors.slice(0, labels.length),

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "70%",

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        });


    createCategoryLegend(
        labels,
        values,
        colors
    );

}


function createCategoryLegend(
    labels,
    values,
    colors
) {

    const total =
        values.reduce(
            (sum, value) => sum + value,
            0
        );


    const legend =
        document.getElementById(
            "categoryLegend"
        );


    legend.innerHTML =
        labels.map((label, index) => {

            const percent =
                ((values[index] / total) * 100)
                .toFixed(0);


            return `

                <div class="legend-item">

                    <div class="legend-name">

                        <span
                            class="legend-dot"
                            style="background:${colors[index]}">
                        </span>

                        ${escapeHTML(label)}

                    </div>

                    <span class="legend-percent">
                        ${percent}%
                    </span>

                </div>

            `;

        }).join("");

}


function updateAnalytics() {

    const expenses =
        transactions.filter(
            t => t.type === "expense"
        );


    const total =
        expenses.reduce(
            (sum, t) => sum + t.amount,
            0
        );


    const average =
        expenses.length
            ? total / expenses.length
            : 0;


    const largest =
        expenses.length
            ? Math.max(
                ...expenses.map(t => t.amount)
              )
            : 0;


    const categories =
        new Set(
            expenses.map(t => t.category)
        );


    document.getElementById(
        "averageExpense"
    ).textContent =
        formatMoney(average);


    document.getElementById(
        "largestExpense"
    ).textContent =
        formatMoney(largest);


    document.getElementById(
        "totalCategories"
    ).textContent =
        categories.size;


    createAnalyticsChart();

}


function createAnalyticsChart() {

    const data =
        getCategoryData();

    const labels =
        Object.keys(data);

    const values =
        Object.values(data);


    const ctx =
        document
        .getElementById(
            "analyticsCategoryChart"
        )
        .getContext("2d");


    if (analyticsCategoryChart) {
        analyticsCategoryChart.destroy();
    }


    if (labels.length === 0) {

        analyticsCategoryChart =
            new Chart(ctx, {

                type: "doughnut",

                data: {

                    labels: ["No expenses"],

                    datasets: [{

                        data: [1],

                        backgroundColor: [
                            "#28344c"
                        ],

                        borderWidth: 0

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "70%",

                    plugins: {
                        legend: {
                            display: true
                        }
                    }

                }

            });

        return;
    }


    analyticsCategoryChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    backgroundColor: [
                        "#7957ff",
                        "#388cff",
                        "#00d7a7",
                        "#ff4d72",
                        "#ffb84d",
                        "#e66cff",
                        "#36c2ce",
                        "#8e9cff",
                        "#ff7b54"
                    ],

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            color:
                                getComputedStyle(document.body)
                                .getPropertyValue("--muted"),

                            font: {
                                size: 10
                            },

                            boxWidth: 12

                        }

                    }

                }

            }

        });

}


function applyTheme(isDark) {

    if (isDark) {

        document.body.classList.remove("light");

        themeToggle.checked = true;
        settingsTheme.checked = true;

    } else {

        document.body.classList.add("light");

        themeToggle.checked = false;
        settingsTheme.checked = false;

    }


    localStorage.setItem(
        "expensifyDarkMode",
        isDark
    );


    setTimeout(() => {

        createMonthlyChart();
        createCategoryChart();

        if (
            document
            .getElementById("analytics")
            .classList.contains("active-page")
        ) {
            createAnalyticsChart();
        }

    }, 50);

}


themeToggle.addEventListener(
    "change",
    () => applyTheme(themeToggle.checked)
);


settingsTheme.addEventListener(
    "change",
    () => applyTheme(settingsTheme.checked)
);


document
    .getElementById("clearDataBtn")
    .addEventListener("click", () => {

        if (
            !confirm(
                "Are you sure you want to delete all transactions?"
            )
        ) {
            return;
        }

        transactions = [];

        saveTransactions();

        updateEverything();

    });


document
    .getElementById("viewAllBtn")
    .addEventListener("click", () => {

        document
            .querySelector('[data-page="transactions"]')
            .click();

    });


function updateEverything() {

    updateSummary();

    updateRecentTransactions();

    updateTransactionList();

    createMonthlyChart();

    createCategoryChart();

    updateAnalytics();

}


const savedTheme =
    localStorage.getItem(
        "expensifyDarkMode"
    );


if (savedTheme === "false") {

    applyTheme(false);

} else {

    applyTheme(true);

}


updateEverything();