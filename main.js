class SliderController {
  constructor(ele, opts) {
    console.log('init new slider', ele)
    this.el = ele
    this.$el = $(this.el)
    this.totalChild = this.$el.children().length
    this.opts = opts
    this.active = false
    this.curr = 0
    this.initialize(this.el, this.opts)
  }

  initialize() {
    const currIndex = this.curr
    this.$el.addClass('slider')

    this.$el.children().each((i, child) => {
      $(child).addClass('slide')
      if (i === currIndex) {
        $(child).css('left', '0')
      }
    })

    $('<button>').text('Next').insertAfter(this.el).click(() => this.next.apply(this))
    $('<button>').text('Prev').insertAfter(this.el).click(() => this.prev.apply(this))

    return this
  }

  async next() {
    if (this.active) {
      // console.log('return')
      return
    }
    

    this.active = true

    let currIndex = this.curr
    let nextIndex = currIndex === (this.totalChild - 1) ? 0 : currIndex + 1

    let $curr = this.$el.children().eq(currIndex)
    let $next = this.$el.children().eq(nextIndex)

    $('.animation').removeClass('animation')

    $next.css('left', '100%')

    await setTimeout(() => {
      $curr.addClass('animation').css('left', '-100%')
      $next.addClass('animation').css('left', '0')
      setTimeout(() => {
        this.active = false
      }, 400)
    }, 10)

    this.curr = nextIndex
  }

  prev() {
    if (this.active) {
      this.active = false
      let currIndex = this.curr
      let prevIndex = currIndex === 0 ? (this.totalChild - 1) : currIndex - 1
  
      let $curr = this.$el.children().eq(currIndex)
      let $prev = this.$el.children().eq(prevIndex)
  
      $('.animation').removeClass('animation')
  
      $prev.css('left', '-100%')
  
      setTimeout(() => {
        $curr.addClass('animation').css('left', '100%')
        $prev.addClass('animation').css('left', '0')
      }, 10)
  
      this.curr = prevIndex
    }
    this.active = true
  }
}