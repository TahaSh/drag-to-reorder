import './style.css'

/***********************
 *      Variables       *
 ***********************/

let listContainer

let draggableItem

let pointerStartX
let pointerStartY

let itemsGap = 0

let items = []

/***********************
 *    Helper Functions   *
 ***********************/

function getAllItems() {
  if (!items?.length) {
    items = Array.from(listContainer.querySelectorAll('.js-item'))
  }
  return items
}

function getIdleItems() {
  return getAllItems().filter((item) => item.classList.contains('is-idle'))
}

function isItemAbove(item) {
  return item.hasAttribute('data-is-above')
}

function isItemToggled(item) {
  return item.hasAttribute('data-is-toggled')
}

/***********************
 *        Setup        *
 ***********************/

function setup() {
  listContainer = document.querySelector('.js-list')

  if (!listContainer) return

  listContainer.addEventListener('mousedown', dragStart)
  listContainer.addEventListener('touchstart', dragStart)

  document.addEventListener('mouseup', dragEnd)
  document.addEventListener('touchend', dragEnd)
}

/***********************
 *     Drag Start      *
 ***********************/

function dragStart(e) {
  if (e.target.classList.contains('js-drag-handle')) {
    draggableItem = e.target.closest('.js-item')
  }

  if (!draggableItem) return

  pointerStartX = e.clientX || e.touches[0].clientX
  pointerStartY = e.clientY || e.touches[0].clientY

  setItemsGap()
  disablePageScroll()
  initDraggableItem()
  initItemsState()

  document.addEventListener('mousemove', drag)
  document.addEventListener('touchmove', drag, { passive: false })
}

function setItemsGap() {
  if (getIdleItems().length <= 1) {
    itemsGap = 0
    return
  }

  const item1 = getIdleItems()[0]
  const item2 = getIdleItems()[1]

  const item1Rect = item1.getBoundingClientRect()
  const item2Rect = item2.getBoundingClientRect()

  itemsGap = Math.abs(item1Rect.bottom - item2Rect.top)
}

function disablePageScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'
  document.body.style.userSelect = 'none'
}

function initItemsState() {
  getIdleItems().forEach((item, i) => {
    if (getAllItems().indexOf(draggableItem) > i) {
      item.dataset.isAbove = ''
    }
  })
}

function initDraggableItem() {
  draggableItem.classList.remove('is-idle')
  draggableItem.classList.add('is-draggable')
}

/***********************
 *        Drag         *
 ***********************/

function drag(e) {
  if (!draggableItem) return

  e.preventDefault()

  const clientX = e.clientX || e.touches[0].clientX
  const clientY = e.clientY || e.touches[0].clientY

  const pointerOffsetX = clientX - pointerStartX
  const pointerOffsetY = clientY - pointerStartY

  draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`

  updateIdleItemsStateAndPosition()
}

function updateIdleItemsStateAndPosition() {
  const draggableItemRect = draggableItem.getBoundingClientRect()
  const draggableItemY = draggableItemRect.top + draggableItemRect.height / 2

  // Update state
  getIdleItems().forEach((item) => {
    const itemRect = item.getBoundingClientRect()
    const itemY = itemRect.top + itemRect.height / 2
    if (isItemAbove(item)) {
      if (draggableItemY <= itemY) {
        item.dataset.isToggled = ''
      } else {
        delete item.dataset.isToggled
      }
    } else {
      if (draggableItemY >= itemY) {
        item.dataset.isToggled = ''
      } else {
        delete item.dataset.isToggled
      }
    }
  })

  // Update position
  getIdleItems().forEach((item) => {
    if (isItemToggled(item)) {
      const direction = isItemAbove(item) ? 1 : -1
      item.style.transform = `translateY(${
        direction * (draggableItemRect.height + itemsGap)
      }px)`
    } else {
      item.style.transform = ''
    }
  })
}

/***********************
 *      Drag End       *
 ***********************/

function dragEnd() {
  if (!draggableItem) return

  applyNewItemsOrder()
  cleanup()
}

function applyNewItemsOrder() {
  const reorderedItems = []

  getAllItems().forEach((item, index) => {
    if (item === draggableItem) {
      return
    }
    if (!isItemToggled(item)) {
      reorderedItems[index] = item
      return
    }
    const newIndex = isItemAbove(item) ? index + 1 : index - 1
    reorderedItems[newIndex] = item
  })

  for (let index = 0; index < getAllItems().length; index++) {
    const item = reorderedItems[index]
    if (typeof item === 'undefined') {
      reorderedItems[index] = draggableItem
    }
  }

  reorderedItems.forEach((item) => {
    listContainer.appendChild(item)
  })
}

function cleanup() {
  itemsGap = 0
  items = []
  unsetDraggableItem()
  unsetItemState()
  enablePageScroll()

  document.removeEventListener('mousemove', drag)
  document.removeEventListener('touchmove', drag)
}

function unsetDraggableItem() {
  draggableItem.style = null
  draggableItem.classList.remove('is-draggable')
  draggableItem.classList.add('is-idle')
  draggableItem = null
}

function unsetItemState() {
  getIdleItems().forEach((item, i) => {
    delete item.dataset.isAbove
    delete item.dataset.isToggled
    item.style.transform = ''
  })
}

function enablePageScroll() {
  document.body.style.overflow = ''
  document.body.style.touchAction = ''
  document.body.style.userSelect = ''
}

/***********************
 *      Start Here     *
 ***********************/

setup()
