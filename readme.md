# 🍢 A simple `jQuery` plugin SlideShow @ [PageFly](https://apps.shopify.com/pagefly)

## Installation

```bash
yarn add slider-x

# or npm i slider-x
```

## Usage

Set up your markup
```html
<div class='your-slider'>
  <div class="slide-item">0</div>
  <div class="slide-item">1</div>
  <div class="slide-item">2</div>
  <div class="slide-item">3</div>
</div>
```

Import the script and init `SliderX`
```js
import 'slider-x'
import 'slider-x/dist/slider-x.css'

let sliderNode = document.querySelector('.your-slider-class-name')
let slider = new SliderX(sliderNode [, options])
```

## Options
```js
let defaultOptions = {
  slidesToShow: 1,
  slidesToScroll: 1,
  gutter: 0,
  autoPlay: true,
  autoPlayDelay: 3000,
  duration: 450,
  loop: true,
  draggable: true,
  paginationStyle: 'pagination-style-1',
  navStyle: 'nav-style-1',
  adaptiveHeight: false,
  height: 400,
}

// Style options, pick one for the `paginationStyle` and `navStyle`
SliderX.styleOptions = {
  paginations: ['pagination-style-1', 'pagination-style-2', 'pagination-style-3', 'none'],
  navs: ['nav-style-1 fa-caret', 'nav-style-2 fa-angle', 'nav-style-3 fa-angle', 'nav-style-4 fa-long-arrow', 'nav-style-5 fa-long-arrow', 'none']
}
```

## Methods

```js
// Initialize slider
slider.init()

// Update options
slider.updateOptions(newOptions)

// Destroy slider
slider.destroy()

// Go to slider at index
slider.goto(index)

// Go to next slider
slider.next()

// Go to previous slider
slider.prev()

// Pause slider (if `autoPlay` is true)
slider.pause()

// Making it move again (after pausing it)
slider.play()
```

Happy sliding 🍻
