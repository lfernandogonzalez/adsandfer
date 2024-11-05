// Function to open the modal
function openModal(event) {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById("modalOverlay").style.display = "block";
    document.getElementById("modal").style.display = "block";
  }
  
  // Function to close the modal
  function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("modal").style.display = "none";
  }
  
  // Close modal when clicking on the overlay
  document.getElementById("modalOverlay").addEventListener("click", closeModal);