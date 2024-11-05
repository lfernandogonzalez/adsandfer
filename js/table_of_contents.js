 // Select all <h2> elements and the TOC container
  const headers = document.querySelectorAll('h2');
  const tocContainer = document.getElementById('toc-links');

  // Loop through each <h2> element
  headers.forEach(header => {
    // Generate an ID by making the text lowercase and replacing spaces with dashes
    const id = header.textContent.toLowerCase().replace(/\s+/g, '-');
    
    // Set the ID for the <h2> element
    header.id = id;

    // Create a link element for the TOC
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = header.textContent;

    // Append the link to the TOC container
    tocContainer.appendChild(link);

    // Add a separator ("/") except after the last item
    if (header !== headers[headers.length - 1]) {
      tocContainer.appendChild(document.createTextNode(' / '));
    }
  });