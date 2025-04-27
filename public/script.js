window.addEventListener('load', () => 
  {
  const canvas = document.getElementById('buffer');
  const ctx = canvas.getContext('2d');

  canvas.width = 100;
  canvas.height = 100;

  let angle = 0;

  function drawLoader() 
  {
      var c = document.getElementById("buffer");
      var ctx = c.getContext("2d");
      ctx.font = "30px Arial";
      ctx.strokeText("Slick.it",10,50);
  }

  drawLoader();

  refreshMiniCart();

  setTimeout(() => {
      document.getElementById('overlay').style.display = 'none';
      document.getElementById('content').style.display = 'block';
  }, 1000);
});


function addToCart(id, name, price, image) {
  fetch('/add-to-cart', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, price, image })
  })
  .then(response => response.json())
  .then(data => {
      if (data.message) {
          showFlashMessage(data.message);
          refreshMiniCart();
      }
  })
  .catch(error => console.error('Error:', error));
}



function refreshMiniCart() {
  fetch('/commoncart')
    .then(res => res.text())
    .then(html => {
      document.getElementById('mini-cart-container').innerHTML = html;
    })
    .catch(error => console.error('Error fetching mini cart:', error));
}

$(document).on('click', '.removebutton', function(e) {
  e.preventDefault(); 

  const itemId = $(this).data('id');

  $.post('/remove-from-cart', { id: itemId }, function(response) {
      if (response.success) {
          refreshMiniCart();
      } else {
          alert(response.message);
      }
  }).fail(function() {
      alert('Error removing item from cart. Please try again.');
  });
});


function showFlashMessage(message) {
  const flashMessageContainer = document.getElementById('flash-message');
  flashMessageContainer.textContent = message;
  flashMessageContainer.style.display = 'block';

  setTimeout(() => {
      flashMessageContainer.style.opacity = '0';
      setTimeout(() => {
          flashMessageContainer.style.display = 'none';
          flashMessageContainer.style.opacity = '1';
      }, 500);
  }, 5000);
}



