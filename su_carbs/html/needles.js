// Color mapping for needles
if (typeof needleColorMap === 'undefined') {
    needleColorMap = {
        'GH': '#FF0000',  // Red
        'GI': '#0000FF',  // Blue
        'GJ': '#00FF00',  // Green
        'GL': '#FFA500',  // Orange
        'GM': '#800080',  // Purple
        'GN': '#00FFFF',  // Cyan
        'GO': '#FF00FF',  // Magenta
        'GP': '#008000',  // Dark Green
        'L':  '#FFC0CB',  // Pink
        'L11': '#A52A2A', // Brown
        'L12': '#FFD700', // Gold
        'LS': '#4B0082',  // Indigo
        'LS1': '#FF4500', // Orange Red
        'M': '#2E8B57',   // Sea Green
        'MI': '#DC143C',  // Crimson
        'M2': '#4682B4'   // Steel Blue
    };
}


async function fetchData() {
    const response = await fetch('/su_carbs/html/needle_data.json');
    const data = await response.json();
    return data;
}

async function initialize() {
    const data = await fetchData();
    const needleList = document.getElementById('needleList');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    // Create needle checkboxes
    data.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'needle-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.needle;
        checkbox.value = item.needle;
        checkbox.className = 'needle-checkbox';
        
        checkbox.addEventListener('change', () => plotChart());
        
        const label = document.createElement('label');
        label.htmlFor = item.needle;
        label.textContent = item.needle;
        
        const colorSpan = document.createElement('span');
        colorSpan.className = 'needle-colors';
        colorSpan.style.backgroundColor = needleColorMap[item.needle];
        
        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(colorSpan);
        needleList.appendChild(div);
    });

    selectAllCheckbox.addEventListener('change', (e) => {
        const needleCheckboxes = document.querySelectorAll('.needle-checkbox');
        needleCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
        plotChart();
    });

    needleList.addEventListener('change', (e) => {
        if (e.target.className === 'needle-checkbox') {
            const needleCheckboxes = document.querySelectorAll('.needle-checkbox');
            const allChecked = Array.from(needleCheckboxes).every(checkbox => checkbox.checked);
            const anyChecked = Array.from(needleCheckboxes).some(checkbox => checkbox.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = anyChecked && !allChecked;
        }
    });

    plotChart();
}

// Rest of the plotChart function remains the same
// [Previous plotChart function code goes here]
async function plotChart() {
    const data = await fetchData();
    const selectedNeedles = Array.from(document.querySelectorAll('.needle-checkbox:checked'))
        .map(checkbox => checkbox.value);

    const sections = Object.keys(data[0].sections).sort((a, b) => Number(a) - Number(b));
    
    const datasets = selectedNeedles.map((needle, index) => {
        const needleData = data.find(item => item.needle === needle);
        const values = sections.map(section => {
            const value = needleData.sections[section];
            return value === 0 ? null : value;  // Convert 0 back to null
        });

        return {
            label: needle,
            data: values,
            borderColor: needleColorMap[needle],
            fill: false,
            spanGaps: true,
            pointRadius: 0,
            needleName: needle
        };
    });

    const ctx = document.getElementById('chart').getContext('2d');

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sections,
            datasets: datasets
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    right: 200  // Increased to accommodate three columns
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        idleBox: {
                            type: 'box',
                            xMin: 0.0,
                            xMax: 2.0,
                            backgroundColor: 'rgba(255, 223, 0, 0.2)',
                            borderColor: 'rgba(255, 223, 0, 0.5)',
                            label: {
                                display: true,
                                content: 'Idle\n AFR 12.5-13',
                                position: 'start'
                            }
                        },
                        accelerationBox: {
                            type: 'box',
                            xMin: 2.0,
                            xMax: 5.0,
                            backgroundColor: 'rgba(50, 205, 50, 0.2)',
                            borderColor: 'rgba(50, 205, 50, 0.5)',
                            label: {
                                display: true,
                                content: 'Light Acc.\n AFR 12.5-13.5',
                                position: 'start'
                            }
                        },
                        cruiseBox: {
                            type: 'box',
                            xMin: 5.0,
                            xMax: 8.0,
                            backgroundColor: 'rgba(30, 144, 255, 0.2)',
                            borderColor: 'rgba(30, 144, 255, 0.5)',
                            label: {
                                display: true,
                                content: 'Cruise\n AFR 14-14.7',
                                position: 'start'
                            }
                        },
                        powerBox: {
                            type: 'box',
                            xMin: 8.0,  
                            xMax: 13.0,
                            backgroundColor: 'rgba(255, 105, 180, 0.2)',
                            borderColor: 'rgba(255, 105, 180, 0.5)',
                            label: {
                                display: true,
                                content: 'Load\n AFR 12.5-13',
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sections'
                    }
                },
                y: {
                    reverse: true,
                    title: {
                        display: true,
                        text: 'Square Inches'
                    }
                }
            }
        },
        plugins: [{
            id: 'needleLabels',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                const yAxis = chart.scales.y;
                const xAxis = chart.scales.x;
                const chartArea = chart.chartArea;
                
                const labelSection = '13';
                const dataIndex = sections.indexOf(labelSection);
                
                // Get all labels and their positions
                const labels = chart.data.datasets.map(dataset => {
                    // Find the last valid non-zero data point for this needle
                    let lastValue = null;
                    let lastValidIndex = null;
                    for (let i = dataset.data.length - 1; i >= 0; i--) {
                        if (dataset.data[i] !== null && dataset.data[i] !== undefined && dataset.data[i] !== 0) {
                            lastValue = dataset.data[i];
                            lastValidIndex = i;
                            break;
                        }
                    }

                    if (lastValidIndex !== null) {
                        return {
                            text: dataset.needleName,
                            color: dataset.borderColor,
                            dataset: dataset,
                            yValue: lastValue,
                            xValue: sections[lastValidIndex],
                            needsLeader: lastValidIndex < sections.length - 1  // Add leader if doesn't extend to section 13
                        };
                    }
                    return null;
                }).filter(l => l !== null);

                // Sort labels by Y value
                labels.sort((a, b) => a.yValue - b.yValue);

                // Position labels in columns
                const minYSpacing = 25;
                const labelOffset = 15;
                const columnWidth = 60;

                // First pass: try to place all labels in first column
                labels.forEach(label => {
                    const yPos = yAxis.getPixelForValue(label.yValue);
                    label.adjustedY = yPos;  // Keep Y position aligned with line
                    label.x = chartArea.right + labelOffset;  // Start in first column
                    label.column = 1;
                });

                // Second pass: move labels to second or third column if they overlap
                for (let i = 1; i < labels.length; i++) {
                    const label = labels[i];
                    const prevLabel = labels[i - 1];
                    
                    if (Math.abs(label.adjustedY - prevLabel.adjustedY) < minYSpacing) {
                        if (prevLabel.column === 1) {
                            // Move to second column
                            label.x = chartArea.right + labelOffset + columnWidth;
                            label.column = 2;
                        } else if (prevLabel.column === 2) {
                            // Move to third column
                            label.x = chartArea.right + labelOffset + (columnWidth * 2);
                            label.column = 3;
                        }
                    }
                }

                // Draw all labels and leader lines
                labels.forEach(label => {
                    const dataEndX = xAxis.getPixelForValue(label.xValue);
                    const dataEndY = label.adjustedY;
                    
                    // Draw leader line if needed
                    if (label.needsLeader || label.column > 1) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.strokeStyle = label.color;
                        ctx.setLineDash([2, 2]);
                        ctx.moveTo(dataEndX, dataEndY);
                        ctx.lineTo(label.x, dataEndY);
                        ctx.stroke();
                        ctx.restore();
                    }
                    
                    // Draw label
                    ctx.save();
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 12px Arial';
                    const textWidth = ctx.measureText(label.text).width;
                    const padding = 4;
                    ctx.fillRect(label.x, dataEndY - 8, textWidth + (padding * 2), 16);
                    
                    ctx.fillStyle = label.color;
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label.text, label.x + padding, dataEndY);
                    ctx.restore();
                });
            }
        }]
    });
}


initialize(); 