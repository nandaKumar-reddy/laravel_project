import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import ApexCharts from "react-apexcharts"; // Import ApexCharts for React

function AdminDashboard() {
    const [ticketData, setTicketData] = useState(null);
    const [filter, setFilter] = useState("last_month"); // default filter
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketData = async () => {
            setLoading(true);
            try {
                // Fetch data for the chart
                const response = await fetch(
                    `http://127.0.0.1:8000/api/admin/dashboard-tickets?filter=${filter}`
                );
                const data = await response.json();
                setTicketData(data); // Set the fetched ticket data (for the chart)
            } catch (error) {
                console.error("Error fetching ticket data:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchTicketData();
    }, [filter]); // Re-run this effect when the filter changes

    const handleDownloadReport = async () => {
        const url = `http://127.0.0.1:8000/api/admin/download-report?filter=${filter}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const blob = await response.blob(); // Assuming the API returns a file
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `tickets_report.csv`; // Customize file name
            link.click();
        } catch (error) {
            console.error("Error downloading report:", error);
        }
    };

    // Access statusCounts from API response (if data is available)
    const statusCounts = ticketData?.statusCounts || {
        pending: 0,
        on_hold: 0,
        in_progress: 0,
        resolved: 0,
        waiting_reply: 0,
        replied: 0,
    };
    // const newTickets = ticketData?.newTickets || [];
    // const overdueTickets = ticketData?.overdueTickets || [];

    if (loading) return <Layout>Loading...</Layout>;

    // Chart Data for Activity Overview (Pie Chart)
    const activityData = statusCounts
        ? {
              series: [
                  statusCounts.pending || 0,
                  statusCounts.on_hold || 0,
                  statusCounts.in_progress || 0,
                  statusCounts.resolved || 0,
                  statusCounts.waiting_reply || 0,
                  statusCounts.replied || 0,
              ],
              options: {
                  chart: {
                      type: "pie",
                      animations: {
                          enabled: true,
                          easing: "easeinout",
                          speed: 1200,
                      },
                  },
                  colors: [
                      "#FF5733",
                      "#33FF57",
                      "#3357FF",
                      "#FF33A1",
                      "#FF8D33",
                      "#A133FF",
                  ], // Vibrant color palette
                  labels: [
                      "Pending",
                      "On Hold",
                      "In Progress",
                      "Resolved",
                      "Waiting Reply",
                      "Replied",
                  ],
                  legend: {
                      position: "bottom",
                      fontSize: "14px",
                  },
                  responsive: [
                      {
                          breakpoint: 480,
                          options: {
                              chart: {
                                  width: 250,
                              },
                              legend: {
                                  position: "bottom",
                              },
                          },
                      },
                  ],
              },
          }
        : null;

    const pendingTicketsData = {
        series: [
            {
                name: "Pending Tickets",
                data: ticketData?.userData
                    ? ticketData.userData.map((user) => user.pending || 0)
                    : [],
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 350,
                animations: {
                    enabled: true,
                    easing: "easeinout",
                    speed: 1200,
                },
            },
            colors: [
                "#F44336",
                "#4CAF50",
                "#2196F3",
                "#FFC107",
                "#9C27B0",
                "#E91E63",
            ], // Modern color palette for bars
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    horizontal: false,
                    columnWidth: "50%",
                },
            },
            xaxis: {
                categories: ticketData?.userData
                    ? ticketData.userData.map(
                          (user) => user.user_name || "Unknown User"
                      )
                    : [],
                labels: {
                    style: {
                        fontSize: "13px",
                        fontWeight: "bold",
                        colors: "#333",
                    },
                },
            },
            fill: {
                opacity: 0.9,
            },
            grid: {
                show: true,
                borderColor: "#ddd",
            },
            dataLabels: {
                enabled: false,
            },
        },
    };
    // Handle filter change
    const handleFilterChange = (event) => {
        const newFilter = event.target.value;
        if (filter !== newFilter) {
            setFilter(newFilter);
        }
    };

    const getWeeklyTicketData = (tickets = []) => {
    
        if (!tickets.length) {
            console.warn("⚠️ No new tickets found!");
            return [];
        }
    
        const last7Days = {};
        const today = new Date();
    
        // Initialize last 7 days with zero counts
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
            last7Days[formattedDate] = 0;
        }
    
        // Count tickets for each date using `dt` instead of `created_at`
        tickets.forEach(ticket => {
            if (!ticket.dt) {
                console.warn("⚠️ Ticket missing `dt` field:", ticket);
            } else {
                const date = ticket.dt.split(" ")[0]; // Extract YYYY-MM-DD
                if (last7Days.hasOwnProperty(date)) {
                    last7Days[date] += 1;
                }
            }
        });
    
        return Object.keys(last7Days).map(date => ({
            date,
            count: last7Days[date],
        }));
    };

    const weeklyTicketData = ticketData?.newTickets ? getWeeklyTicketData(ticketData.newTickets) : [];

    const weeklyTicketsChart = {
        series: [{
            name: "Tickets Created",
            data: weeklyTicketData.map(item => item.count),
        }],
        options: {
            chart: {
                type: "bar",
                height: 350,
                animations: { enabled: true, easing: "easeinout", speed: 1200 },
            },
            xaxis: {
                categories: weeklyTicketData.map(item => item.date),
                title: { text: "Date" },
            },
            yaxis: {
                title: { text: "Tickets Created" },
                min: 0, // ✅ Ensures even small numbers are visible
            },
            colors: ["#1E90FF"],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
                    columnWidth: "50%",
                },
            },
            dataLabels: { enabled: false },
        },
    };
    

    if (loading) return <Layout>Loading...</Layout>;
    return (
        <Layout>
            {/* Filter dropdown with label and download report button */}
            <div className="flex sm:flex-row justify-between items-center mb-8 py-4 rounded-lg">
                {/* Filter Section */}
                <div className="flex items-center space-x-4 sm:mb-0">
                    <label htmlFor="filter" className="text-lg font-semibold">
                        Filter:
                    </label>
                    <select
                        id="filter"
                        value={filter}
                        onChange={handleFilterChange}
                        className="p-3 border-2 border-gray-300 cursor-pointer rounded-lg text-black shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ease-in-out"
                    >
                        <option value="last_week">Last Week</option>
                        <option value="last_month">Last Month</option>
                        <option value="last_3_months">Last 3 Months</option>
                    </select>
                </div>

                {/* Download Report Button Section */}
                <div>
                    <button
                        onClick={handleDownloadReport}
                        className="text-white p-3 rounded-lg bg-[#f8703c] hover:bg-gradient-to-l hover:scale-105 transition-all duration-300 ease-in-out shadow-lg"
                    >
                        Download Report
                    </button>
                </div>
            </div>

            {/* Ticket Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
                {statusCounts && (
                    <>
                        {[
                            {
                                label: "Pending",
                                value: statusCounts.pending,
                                color: "bg-gradient-to-br from-red-500 to-red-700",
                            },
                            {
                                label: "On Hold",
                                value: statusCounts.on_hold,
                                color: "bg-gradient-to-br from-yellow-500 to-yellow-700",
                            },
                            {
                                label: "In Progress",
                                value: statusCounts.in_progress,
                                color: "bg-gradient-to-br from-blue-500 to-blue-700",
                            },
                            {
                                label: "Resolved",
                                value: statusCounts.resolved,
                                color: "bg-gradient-to-br from-green-500 to-green-700",
                            },
                            {
                                label: "Waiting Reply",
                                value: statusCounts.waiting_reply,
                                color: "bg-gradient-to-br from-purple-500 to-purple-700",
                            },
                            {
                                label: "Replied",
                                value: statusCounts.replied,
                                color: "bg-gradient-to-br from-pink-500 to-pink-700",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`${item.color} text-white rounded-xl shadow-lg p-6 transform hover:scale-110 transition-transform duration-300`}
                            >
                                <h3 className="text-4xl font-extrabold drop-shadow">
                                    {item.value || 0}
                                </h3>
                                <p className="text-lg font-medium mt-1">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate__animated animate__fadeInUp">
                {/* Activity Overview - Pie Chart */}
                {activityData && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl text-center font-semibold text-gray-700 mb-4">
                            Activity Overview
                        </h2>
                        <ApexCharts
                            options={activityData.options}
                            series={activityData.series}
                            type="pie"
                            height={350}
                        />
                    </div>
                )}

                {/* Pending Tickets Bar Chart */}
                {ticketData && ticketData.userData && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl text-center font-semibold text-gray-700 mb-4">
                            Ticket Status
                        </h2>
                        <ApexCharts
                            options={pendingTicketsData.options}
                            series={pendingTicketsData.series}
                            type="bar"
                            height={350}
                        />
                    </div>
                )}
            </div>

             {/* Weekly Tickets Column Chart */}
             <div className="bg-white p-6 rounded-xl shadow-lg mt-5">
                    <h2 className="text-xl text-center font-semibold text-gray-700 mb-4">
                        Weekly Created Tickets
                    </h2>
                    <ApexCharts options={weeklyTicketsChart.options} series={weeklyTicketsChart.series} type="bar" height={350} />
                </div>
        </Layout>
    );
}

export default AdminDashboard;
