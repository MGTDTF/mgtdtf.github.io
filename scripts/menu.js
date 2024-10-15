document.addEventListener("DOMContentLoaded", function() {
    const pdfContainer = document.getElementById('pdf-container');

    // Load the XML file and generate the menu
    fetch('/xml/PDF.xml')
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
                    loadPDF(url); // Call the function to load the PDF into the canvas
                    toggleMenu();
                };

                menuItem.appendChild(link); // Append the link to the list item
                return menuItem;
            };

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

    // PDF rendering and loading functions
    const loadPDF = (url) => {
        pdfjsLib.getDocument(url).promise.then((pdfDoc) => {
            const totalPages = pdfDoc.numPages;

            console.debug(url);
            console.debug(totalPages);

            // Clear the pdfContainer before loading a new PDF
            pdfContainer.innerHTML = ''; // Clear previous pages

            // Render each page
            for (let i = 1; i <= totalPages; i++) {
                renderPage(i, pdfDoc); // Pass pdfDoc to renderPage
            }
        }).catch(error => {
            console.error('Error loading PDF:', error);
        });
    };

    const renderPage = (num, pdfDoc) => { // Add pdfDoc as a parameter
        pdfDoc.getPage(num).then(page => {
            const scale = pdfContainer.clientWidth / page.getViewport({ scale: 1 }).width; // Calculate scale based on container width
            const viewport = page.getViewport({ scale: scale });

            // Create a new canvas for this page
            const pdfCanvas = document.createElement('canvas');
            const context = pdfCanvas.getContext('2d');

            // Set the canvas width to 100% of the container
            pdfCanvas.style.width = '100%';
            pdfCanvas.width = viewport.width; // Set the actual width to viewport width for proper rendering
            pdfCanvas.height = viewport.height; // Set the height according to the viewport height

            // Clear the canvas context before rendering
            context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);

            // Set the render context
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            // Render the page
            page.render(renderContext).promise.then(() => {
                // After rendering, append the canvas to the container
                pdfContainer.appendChild(pdfCanvas);
            }).catch(error => {
                console.error('Error rendering page:', error);
            });
        }).catch(error => {
            console.error('Error getting page:', error);
        });
    };
});
