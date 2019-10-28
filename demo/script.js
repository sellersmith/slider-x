window.addEventListener('load', function() {
  console.log('Document Loaded!!')

  const $slides = document.querySelectorAll('.my-slide div')

  $slides.forEach(($sl, i) => {
    $sl.addEventListener('click', () => {console.log(`Clicked slide ${i}`)})
  })
})