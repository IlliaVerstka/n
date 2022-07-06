function testWebP(callback) {
   var webP = new Image();
   webP.onload = webP.onerror = function () {
      callback(webP.height == 2);
   };
   webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
testWebP(function (support) {
   if (support == true) {
      document.querySelector('body').classList.add('webp');
   }
});
class Me {
   constructor(type) {
      this.typeMedia = type
   }
   init() {
      this.elements = document.querySelectorAll('[data-me]')
      this.objects = []

      if (this.elements.length > 0) {
         for (let index = 0; index < this.elements.length; index++) {
            const meElement = this.elements[index];

            const obj = {}
            obj.el = meElement
            const dataAttr = meElement.dataset.me.split(',').map(item => item.trim())
            obj.dataAttr = {
               size: dataAttr[0],
               block: dataAttr[1],
               index: dataAttr[2],
            }
            obj.parentElement = obj.el.parentElement
            obj.indexParent = Array.from(obj.parentElement.children).indexOf(obj.el)
            this.objects.push(obj)
         }
         for (let index = 0; index < this.objects.length; index++) {
            const obj = this.objects[index];
            const mediaQueryList = window.matchMedia(`(${this.typeMedia}-width:${obj.dataAttr.size}px)`)
            this.mediaHandler(mediaQueryList, obj)
            mediaQueryList.addEventListener('change', e => this.mediaHandler(e, obj))
         }
      }
   }
   mediaHandler(e, obj) {
      if (e.matches) {
         obj.el.classList.add('-me')
         this.moveTo(obj.el, obj.dataAttr.block, obj.dataAttr.index)
      } else {
         obj.el.classList.remove('-me')
         this.moveBack(obj.el, obj.parentElement, obj.indexParent)
      }
   }
   moveTo(element, block, index) {
      if (document.querySelector(block)) {
         const toBlock = document.querySelector(block)
         const blockChildren = toBlock.children
         const indexBlock = index == 'first' ? 0 :
            index == 'last' ? undefined :
               index;

         if (blockChildren[indexBlock] != undefined) {
            blockChildren[indexBlock].insertAdjacentElement(
               'beforebegin',
               element
            )
         } else {
            toBlock.insertAdjacentElement(
               'beforeend',
               element
            )
         }
      }
   }
   moveBack(element, parentElement, index) {
      const blockChildren = parentElement.children

      if (blockChildren[index] != undefined) {
         blockChildren[index].insertAdjacentElement(
            'beforebegin',
            element
         )
      } else {
         parentElement.insertAdjacentElement(
            'beforeend',
            element
         )
      }
   }
}
const me = new Me('max')
me.init()
class ValidateForm {
   constructor(form, objUser) {
      this.form = form
      this.objUser = objUser
      form.addEventListener('submit', e => this.formSend(e, this, form, objUser))
   }
   async formSend(e, thisClass, form, objUser) {
      e.preventDefault()
      const error = thisClass.validateForm(form, objUser)

      if (error === 0) {
         form.classList.add('-sending')
         const formData = new FormData(form)

         const response = await fetch(objUser.url, {
            method: objUser.method,
            // body: formData
         })
         if (response.ok) {
            // const result = await response.json();
            console.log('result');
         } else {
            console.log('Error');
         }

         form.reset()
         if (objUser.items.input && objUser.items.input.length > 0) {
            objUser.items.input.forEach(input => {
               input.blur()
            })
         }
         if (form.querySelectorAll('.-custom-select')) {
            const customSelect = form.querySelectorAll('.-custom-select')
            customSelect.forEach(select => select.reset())
         }
         form.classList.remove('-sending')
      } else {
         console.log('Emptly');
      }
   }
   validateForm(form, objUser) {
      let error = 0;
      for (const prop in objUser.items) {
         const elements = objUser.items[prop]

         if (prop == 'input') {
            if (elements.length > 0) {
               elements.forEach(input => {
                  this.removeError(input)

                  if (input.classList.contains('-tel')) {
                     if (this.telTest(input)) {
                        this.addError(input)
                        error++
                     }
                  } else if (input.classList.contains('-email')) {
                     if (this.emailTest(input)) {
                        this.addError(input)
                        error++
                     }
                  } else if (input.classList.contains('-password')) {
                     if (input.value.length < 8 || input.value.length > 10) {
                        this.addError(input)
                        error++
                        if (input.value.length < 8) {
                           console.log('passswod 8');
                        }
                        if (input.value.length > 10) {
                           console.log('passswod 10');
                        }
                     }
                  } else {
                     if (!input.value) {
                        this.addError(input)
                        error++
                     }
                  }
               })
            }
         }
         if (prop == 'checkbox') {
            if (elements.length > 0) {
               elements.forEach(checkbox => {
                  this.removeError(checkbox)
                  if (!checkbox.checked) {
                     this.addError(checkbox)
                     error++
                  }
               })
            }
         }
         if (prop == 'radio') {
            if (elements.length > 0) {
               const groupsRadio = {}
               elements.forEach(radio => {
                  if (!groupsRadio[radio.name]) {
                     groupsRadio[radio.name] = []
                  }
                  groupsRadio[radio.name].push(radio)
               })
               for (const prop in groupsRadio) {
                  const groupRadio = groupsRadio[prop]
                  const checkedRadio = Array.from(groupRadio).filter(radio => radio.checked)[0]

                  groupRadio.forEach(radio => {
                     this.removeError(radio)
                  })
                  if (!checkedRadio) {
                     groupRadio.forEach(radio => {
                        this.addError(radio)
                        error++
                     })
                  }
               }
            }
         }
         if (prop == 'select') {
            if (elements.length > 0) {
               elements.forEach(select => {
                  select.classList.remove('-error')
                  if (select.classList.contains('-custom-select-no-choose')) {
                     select.classList.add('-error')
                     error++
                  }
               })
            }
         }
      }
      return error;
   }
   removeError(input) {
      input.parentElement.classList.remove('-error')
      input.classList.remove('-error')
      const form = input.closest('form')
      if (form.classList.contains('-error')) {
         form.classList.remove('-error')
      }
   }
   addError(input) {
      input.parentElement.classList.add('-error')
      input.classList.add('-error')
      const form = input.closest('form')
      if (!form.classList.contains('-error')) {
         form.classList.add('-error')
      }
   }
   emailTest(input) {
      return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
   }
   telTest(input) {
      return !/^((8|\+7)[\- ]?)?(\(?\d{3,4}\)?[\- ]?)?[\d\- ]{5,10}$/.test(input.value);
   }
}

const inputsValue = document.querySelectorAll('[data-value]')
if (inputsValue.length > 0) {
   inputsValue.forEach(input => {
      const placeholderValue = input.dataset.value;

      if (!input.value) {
         input.placeholder = placeholderValue
      }

      input.addEventListener('focus', () => {
         input.placeholder = ''
      })
      input.addEventListener('blur', () => {
         input.placeholder = placeholderValue
      })
   })
}
class Tabs {
   init() {
      this.elements = document.querySelectorAll('[data-tab]')
      this.objects = []
      if (this.elements.length > 0) {
         for (let index = 0; index < this.elements.length; index++) {
            const tab = this.elements[index];
            const obj = {}
            obj.el = tab
            obj.items = obj.el.querySelectorAll('[data-tab-item]')
            obj.contents = obj.el.querySelectorAll('[data-tab-content]')
            obj.activeItems = Array.from(obj.items).filter(item => item.classList.contains('-active'))
            obj.itemLabel = obj.el.hasAttribute('data-tab-item-label')

            const mediaSettings = obj.el.dataset.tab.split(',').map(item => item.trim())
            obj.mediaSettings = {
               type: mediaSettings[0],
               size: mediaSettings[1],
            }
            this.objects.push(obj)
         }
         for (let index = 0; index < this.objects.length; index++) {
            const obj = this.objects[index];
            const mediaQueryList = window.matchMedia(`(${obj.mediaSettings.type}-width:${obj.mediaSettings.size}px)`)
            this.mediaHandler(mediaQueryList, obj.el, obj.items, obj.contents, obj.activeItems, obj.itemLabel)
            mediaQueryList.addEventListener('change', e => this.mediaHandler(e, obj.el, obj.items, obj.contents, obj.activeItems, obj.itemLabel))
         }
      }
   }
   mediaHandler(e, tabElement, items, contents, activeItems, itemLabel) {
      if (e.matches) {
         let activeItems = []
         const inactiveItems = []
         items.forEach(item => item.classList.contains('-active') ? activeItems.push(item) : inactiveItems.push(item))
         if (activeItems.length > 0) {
            if (activeItems.length > 1) {
               items.forEach(item => item.classList.remove('-active'))
               items[0].classList.add('-active')
               activeItems = [items[0]]
               if (itemLabel) {
                  slideDown(activeItems[0].nextElementSibling, 0)
               }
            }
            if (itemLabel) {
               activeItems.forEach(item => slideDown(item.nextElementSibling, 0))
               items.forEach(item => {
                  slideUp(item.nextElementSibling, 0)
               })
            }
         } else {
            items[0].classList.add('-active')
            activeItems = [items[0]]
            if (itemLabel) {
               activeItems.forEach(item => slideDown(item.nextElementSibling, 0))
               items.forEach(item => {
                  slideUp(item.nextElementSibling, 0)
               })
            }
         }
         activeItems.forEach(item => {
            const activeContent = []
            const inactiveContent = []
            contents.forEach(content => content.dataset.tabContent == item.dataset.tabItem ? activeContent.push(content) : inactiveContent.push(content))

            activeContent[0].classList.add('-active')
            this.animShow(activeContent[0], false)

            inactiveContent.forEach(content => {
               if (content.classList.contains('-active')) {
                  content.classList.remove('-active')
               }
               this.animHide(content, false)
            })
         })

         tabElement.contents = contents
         tabElement.thisCLass = this
         tabElement.items = items
         tabElement.itemLabel = itemLabel
         tabElement.addEventListener('click', this.actionTabElement)
      } else {
         items.forEach(item => {
            item.classList.remove('-active')
            if (itemLabel) {
               items.forEach(item => {
                  slideDown(item.nextElementSibling, 0)
               })
            }
         })
         contents.forEach(content => {
            content.classList.remove('-active')
            this.animShow(content, false, true)
         })
         if (activeItems) {
            activeItems.forEach(item => item.classList.add('-active'))
         }

         tabElement.removeEventListener('click', this.actionTabElement)
      }
   }
   actionTabElement(e) {
      const target = e.target
      const contents = e.currentTarget.contents
      const thisCLass = e.currentTarget.thisCLass
      const items = e.currentTarget.items
      const itemLabel = e.currentTarget.itemLabel
      const animContents = Array.from(contents).filter(content => content.classList.contains('-anim'))

      if (target.closest('[data-tab-item]')) {
         e.preventDefault()
         if (animContents.length === 0) {
            const item = target.closest('[data-tab-item]')

            if (!item.classList.contains('-active')) {
               let activeContent;
               const inactiveContent = []
               contents.forEach(content => content.dataset.tabContent == item.dataset.tabItem ? activeContent = content : inactiveContent.push(content))

               items.forEach(item => item.classList.remove('-active'))
               item.classList.add('-active')

               activeContent.classList.add('-active')
               thisCLass.animShow(activeContent)
               inactiveContent.forEach(content => {
                  thisCLass.animHide(content)
                  content.classList.remove('-active')
               })
               if (itemLabel) {
                  slideDown(item.nextElementSibling)
                  items.forEach(item => {
                     slideUp(item.nextElementSibling)
                  })
               }
            }
         }
      }
   }
   animHide(el, anim = true) {
      if (anim) {
         el.style.opacity = '0'
         el.classList.add('-anim')
         setTimeout(() => {
            el.style.display = 'none'
            el.classList.remove('-anim')
         }, 200)
      } else {
         el.style.opacity = '0'
         el.style.display = 'none'
      }
   }
   animShow(el, anim = true, removeStyle = false) {
      if (anim) {
         setTimeout(() => {
            el.style.display = 'block'
            el.classList.add('-anim')
            setTimeout(() => {
               el.style.opacity = '1'
               el.classList.remove('-anim')
            }, 200)
         }, 200)
      } else {
         el.style.opacity = '1'
         el.style.display = 'block'
      }
      if (removeStyle) {
         el.style.removeProperty('opacity')
         el.style.removeProperty('display')
      }
   }
}
const tabs = new Tabs()
tabs.init()

document.addEventListener('click', actionDocument)
const headerElement = document.querySelector('.header')
function actionDocument(e) {
   const target = e.target;
   if (target.closest('.burger-header')) {
      const burgerMenu = target.closest('.burger-header')
      const menu = document.querySelector('.menu')
      burgerMenu.classList.add('-active')
      menu.classList.add('-open')
      headerElement.classList.add('-active')
      document.body.classList.add('-lock')
   }
   if (target.closest('.menu__close')) {
      e.preventDefault()
      const menuClose = target.closest('.menu__close')
      const burgerMenu = document.querySelector('.burger-header')
      const menu = document.querySelector('.menu')
      burgerMenu.classList.remove('-active')
      menu.classList.remove('-open')
      headerElement.classList.remove('-active')
      document.body.classList.remove('-lock')
   }
}
const searchFooter = document.querySelector('.search-footer')
if (searchFooter) {
   new ValidateForm(searchFooter, {
      method: 'GET',
      url: '',
      items: {
         input: searchFooter.querySelectorAll('input[type="text"].-req'),
      }
   })
}
const searchForm = document.querySelector('.search__row')
if (searchForm) {
   new ValidateForm(searchForm, {
      method: 'GET',
      url: '',
      items: {
         input: searchForm.querySelectorAll('input[type="text"].-req'),
      }
   })
}

const sliderParts = new Swiper('.slider-parts__body', {
   navigation: {
      nextEl: '.slider-parts__arrows .arrows-slider__arrow_next',
      prevEl: '.slider-parts__arrows .arrows-slider__arrow_prev'
   },
   simulateTouch: true,
   grabCursor: true,
   watchOverflow: false,
   freeMode: true,
   spaceBetween: 23,
   breakpoints: {
      0: {
         slidesPerView: 1.5,
         spaceBetween: 18,
      },
      575.98: {
         slidesPerView: 1.5,
         spaceBetween: 18,
      },
      767.98: {
         slidesPerView: 3,
      },
      991.98: {
         slidesPerView: 5,
      },
   }
})
let sliderBest = null
const mqlSliderBest = window.matchMedia('(min-width: 767.98px)')
function mediaHandlerSliderBest(e) {
   if (e.matches) {
      if (!sliderBest) {
         sliderBest = new Swiper('.slider-best__body', {
            navigation: {
               nextEl: '.slider-best__arrows .arrows-slider-big__arrow_next',
               prevEl: '.slider-best__arrows .arrows-slider-big__arrow_prev'
            },
            simulateTouch: true,
            grabCursor: true,
            slidesPerView: 2,
            watchOverflow: false,
            spaceBetween: 30,
         })
      }
   } else {
      if (sliderBest) {
         sliderBest.destroy()
         sliderBest = null
      }
   }
}
if (document.querySelector('.slider-best__body')) {
   mediaHandlerSliderBest(mqlSliderBest)
   mqlSliderBest.addEventListener('change', e => {
      mediaHandlerSliderBest(e)
   })
}

let sliderAds = null
const mqlSliderAds = window.matchMedia('(min-width: 767.98px)')
function mediaHandlerSliderAds(e) {
   if (e.matches) {
      if (!sliderAds) {
         sliderAds = new Swiper('.slider-ads__body', {
            navigation: {
               nextEl: '.slider-ads__arrows .arrows-slider-big__arrow_next',
               prevEl: '.slider-ads__arrows .arrows-slider-big__arrow_prev'
            },
            simulateTouch: true,
            grabCursor: true,
            watchOverflow: false,
            spaceBetween: 30,
         })
      }
   } else {
      if (sliderAds) {
         sliderAds.destroy()
         sliderAds = null
      }
   }
}
if (document.querySelector('.slider-ads__body')) {
   mediaHandlerSliderAds(mqlSliderAds)
   mqlSliderAds.addEventListener('change', e => {
      mediaHandlerSliderAds(e)
   })
}