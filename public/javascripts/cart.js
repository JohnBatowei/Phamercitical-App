let cart = document.querySelector('.cart')
let cartSection = document.querySelector('.cart-section')
cart.addEventListener('click',(e)=>{
  cartSection.classList.toggle('Toggle')
  // cartSection.style.height = '100%'
})