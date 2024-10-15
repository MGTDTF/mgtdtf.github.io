document.addEventListener("DOMContentLoaded", function() {
    const pdfContainer = document.getElementById('pdf-container');
    const pdfNative = document.getElementById('pdf-native');
    const pdfJs = document.getElementById('pdf-js');
    const homepage = document.getElementById('homepage-container');
    let currentPdfUrl = null;  // Variable to store the current PDF URL

    // Load the XML file and generate the menu
    fetch('/xml/pdf.xml')
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const aside = document.getElementById('menu');
            const menuList = document.createElement('ul'); // Create a new unordered list for the menu

            // Function to create a menu item
            const createMenuItem = (title, url) => {
                const menuItem = document.createElement('li'); // Create a new list item
                const link = document.createElement('a'); // Create a new link
                link.href = `/?pdf=${url}`; // Set the href with the URL parameter
                link.textContent = title; // Set the link text
                link.onclick = function (event) {
                    event.preventDefault(); // Prevent the default link behavior
                    currentPdfUrl = url; // Store the current PDF URL
                    getPDF(url); // Call the function to load the PDF into the canvas
                    toggleMenu();
                };

                menuItem.appendChild(link); // Append the link to the list item
                return menuItem;
            };

            // Add the "Home" menu item
            const homeMenuItem = createMenuItem("Home", "home");
            homeMenuItem.querySelector('a').onclick = function(event) {
                event.preventDefault(); // Prevent default link behavior
                window.location.href = '/'; // Redirect to home page or reload
            };
            menuList.appendChild(homeMenuItem); // Add the "Home" item at the top of the menu


            // Function to create the expandable menu
            const createMenu = (menuElement) => {
                const menuContainer = document.createElement('li'); // Create a new list item for the menu heading
                const title = menuElement.getElementsByTagName('title')[0].textContent;
                const childItems = menuElement.getElementsByTagName('item');

                // Create a heading for the menu
                const menuHeading = document.createElement('span');
                menuHeading.textContent = `+ ${title}`; // Add '+' to indicate expandable item
                menuHeading.style.cursor = 'pointer';

                // Create a sublist for the child items
                const childList = document.createElement('ul');
                for (let j = 0; j < childItems.length; j++) {
                    const childTitle = childItems[j].getElementsByTagName('title')[0].textContent;
                    const childUrl = childItems[j].getElementsByTagName('url')[0].textContent;
                    childList.appendChild(createMenuItem(childTitle, childUrl)); // Append child items
                }
                childList.style.display = 'none'; // Hide child list by default

                menuHeading.onclick = function() {
                    if (childList.style.display === 'none') {
                        childList.style.display = 'block'; // Show child items
                        this.textContent = `- ${title}`; // Change '+' to '-' when expanded
                    } else {
                        childList.style.display = 'none'; // Hide child items
                        this.textContent = `+ ${title}`; // Change '-' back to '+'
                    }
                };

                menuContainer.appendChild(menuHeading); // Append the heading
                menuContainer.appendChild(childList); // Append the child list
                return menuContainer;
            };

            // Process the XML data to create the menu
            const pdfNode = data.getElementsByTagName('pdf')[0];
            const children = pdfNode.childNodes;

            // Loop through the child nodes of the <pdf> element
            for (let i = 0; i < children.length; i++) {
                const child = children[i];

                // Check if the child is a <menu> or <item>
                if (child.nodeName === 'menu') {
                    menuList.appendChild(createMenu(child)); // Append the menu
                } else if (child.nodeName === 'item') {
                    const title = child.getElementsByTagName('title')[0].textContent;
                    const url = child.getElementsByTagName('url')[0].textContent;
                    menuList.appendChild(createMenuItem(title, url)); // Append the item
                }
            }

            aside.appendChild(menuList); // Append the menu list to the aside element
        })
        .catch(error => {
            console.error('Error loading XML:', error);
        });

    let useNativeViewer = false; // Flag to check which viewer to use

    toggleViewButton.addEventListener('click', () => {
        useNativeViewer = !useNativeViewer; // Toggle the flag
        button = document.getElementById('toggleViewButton');
        button.classList.toggle('nativePdfViewer');
        // document.getElementById('pdf-container').classList.toggle('nativePdfViewer');
        if (useNativeViewer) {
            button.textContent = "Switch to PDF.js View"; // Change label
        } else {
            button.textContent = "Switch to Native PDF View"; // Change label
        }

        console.debug("current PDF url: ", currentPdfUrl);
        // Reload the current PDF in the new viewer
        if (currentPdfUrl) {
            currentPage = 1;
            getPDF(currentPdfUrl); // Reload the current PDF without needing to go back to the home screen
        }
    });

    // Function to load PDF based on user preference
    function getPDF(url) {
        console.debug("getPDF url: ", url);
        currentPdfUrl = url; // Store the PDF URL globally
        pdfContainer.style.display = 'block';
        if (useNativeViewer) {
            pdfNative.style.display = 'block';
            pdfJs.style.display = 'none';
            loadNativePDF(url); // Use native PDF viewer
        } else {
            pdfNative.style.display = 'none';
            pdfJs.style.display = 'block';
            loadPDF(url); // Use PDF.js
        }
    }
    
    function loadNativePDF(pdfPath) {
        if (homepage) {
            homepage.style.display = "none"; // Hide the element
        }
        pdfNative.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = pdfPath; // Use the PDF URL
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        pdfNative.appendChild(iframe); // Add the iframe to the container
    }




    // PDF rendering and loading functions
    let pdfDoc = null;
    let currentPage = 1;
    let isRendering = false;
    let canvas = document.getElementById('pdf-canvas');
    let ctx = canvas.getContext('2d');
    
    // Load the PDF
    function loadPDF(url) {
        pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
            if (homepage) {
                homepage.style.display = "none"; // Hide the element
            }
            pdfDoc = pdfDoc_;
            document.getElementById('page-info').textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
            renderPage(currentPage); // Render the first page
        });
    }
    
    // Render a page
    function renderPage(pageNumber) {
        isRendering = true; // Prevent multiple renders at once
        pdfDoc.getPage(pageNumber).then(function (page) {
            let viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed
            canvas.height = viewport.height;
            canvas.width = viewport.width;
    
            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
    
            page.render(renderContext).promise.then(function () {
                isRendering = false; // Mark rendering as complete
                document.getElementById('page-info').textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
            });
        });
    }
    
    // Previous page navigation
    document.getElementById('prev-page').addEventListener('click', function () {
        if (currentPage > 1 && !isRendering) {
            currentPage--;
            renderPage(currentPage);
        }
    });
    
    // Next page navigation
    document.getElementById('next-page').addEventListener('click', function () {
        if (currentPage < pdfDoc.numPages && !isRendering) {
            currentPage++;
            renderPage(currentPage);
        }
    });    
});
