import { SplitText } from "./dev.js";

let windowTablet = 991
let windowMobile = 768

let scroller;
if($('main.main').length) {
    scroller = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        getDirection: true
    });
}
const mm = gsap.matchMedia()

function isElementXPxInViewport(el) {
    if(!el) return false;
    let x = el.getBoundingClientRect().left;
    let y = el.getBoundingClientRect().top;
    let ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let hw = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let w = el.clientWidth;
    let h = el.clientHeight;
    return (
        (y < hw &&
            y + h > 0) &&
        (x < ww &&
            x + w > 0)
    );
}

function dropdown(options) {
    let opts = {
        closeOnClick: true,
        timing: false,
        closeBtnClass: false,
        globalContainer: '',
        effect: 'fade'
    }
    let timing = 300;

    $.extend( opts, options );

    function open(e) {
        e.preventDefault()
        let container = $(this).closest('.'+opts.containerClass)
        let thisDropdown = container.find(opts.dropdownSelector)

        if(e.type === 'focusin')
            container.addClass('focusin')

        if((container.hasClass('is-open') || container.hasClass('disabled')) && !container.hasClass('focusin')){
            close()
            return;
        }

        if(e.type !== 'focusin')
            container.removeClass('focusin')

        close(container)

        container.addClass('is-open').css('z-index', '4')

        if(opts.effect === 'fade') {
            thisDropdown.fadeIn(timing)
        } else {
            thisDropdown.slideDown(timing)
        }
    }
    function close(dontClose = false) {
        let dropdownsToClose = $('.'+opts.containerClass)

        if(dontClose)
            dropdownsToClose = dropdownsToClose.not(dontClose)

        dropdownsToClose.find('li').removeClass('hover')

        dropdownsToClose.removeClass('is-open')

        if(opts.effect === 'fade') {
            dropdownsToClose.find(opts.dropdownSelector).fadeOut(timing)
        } else {
            dropdownsToClose.find(opts.dropdownSelector).slideUp(timing)
        }


        setTimeout(function () {
            dropdownsToClose.removeAttr('style')
        }, timing)
    }

    $(document).on('click', function (e) {
        let thisEl = $(e.target)

        if(opts.closeBtnClass ? thisEl.hasClass(opts.closeBtnClass) : false)
            close()
        if(!thisEl.hasClass(opts.containerClass) && (!thisEl.closest('.'+opts.containerClass).length))
            close()
    })
    $(document).on('click', opts.globalContainer+' .'+opts.containerClass +' '+ opts.btnSelector, open)
    $(document).on('focusin', opts.globalContainer+' .'+opts.containerClass +' '+ opts.btnSelector, open)
    $(document).on('focusout', opts.globalContainer+' .'+opts.containerClass +' '+ opts.btnSelector, function () {
        $(this).closest('.'+opts.containerClass).removeClass('focusin')
        close($(this).closest('.'+opts.containerClass))
    })
    $(document).on('close-dropdown', close)



    if(options.timing !== false)
        timing = options.timing;
    if(options.containerClass === 'select')
        timing = 0;

    if(opts.closeOnClick){
        $(document).on('click', opts.globalContainer+' .'+opts.containerClass +' '+opts.dropdownSelector, function () {
            if(!$(this).closest('.'+opts.containerClass).hasClass('checkbox'))
                close()
        })
    }
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

let isResizeSet = false;
let viewportEl = $('.viewport-height')

function setResizeUpdate(){
    if(isResizeSet) return;
    let resizeTimeout = 0;

    $(window).on('resize', function () {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(function () {
            scroller.update()
        },300)
    })
}

function parallax(sections) {
    function checkContainer(thisContainer, e) {
        if(!isElementXPxInViewport(thisContainer[0])) return;

        let item = thisContainer.find('[data-parallax]')
        let rect = thisContainer[0].getBoundingClientRect();
        let thisContainerScrolled = e.scroll.y - (e.scroll.y + rect.top - window.innerHeight);

        item.each(function () {
            let sensitivity = $(this).attr('data-sensitivity') !== '' ? parseFloat($(this).attr('data-sensitivity')) : 0.1
            let rotationSensitivity = $(this).attr('data-rotation-sensitivity') !== '' ? parseFloat($(this).attr('data-rotation-sensitivity')) : false
            let itemTop = parseFloat($(this).attr('data-top'))
            let parallaxScroll;
            let parallaxRotate = 0;

            if(rotationSensitivity)
                parallaxRotate = thisContainerScrolled * rotationSensitivity

            if($(this).is('[data-scroll-reverse]')) {
                parallaxScroll = itemTop - ((0 - rect.top) * sensitivity)
                parallaxRotate = 0 - parallaxRotate
            } else {
                parallaxScroll = itemTop + ((0 - rect.top) * sensitivity)
            }

            $(this).css({'top': parallaxScroll, 'transform': 'rotate('+parallaxRotate+'deg)'})
        })
    }
    function initSection(container) {
        container.each(function () {
            let thisContainer = $(this)
            let item = thisContainer.find('[data-parallax]:not([data-top])')

            item.each(function () {
                let itemTop = $(this).offset().top - thisContainer.offset().top
                $(this).attr('data-top', itemTop)
            })
        })

        scroller.on('scroll', function (e) {
            checkContainer(container, e)
        })
    }

    sections.each(function () {
        if($(this).find('[data-parallax]').length)
            initSection($(this).find('[data-parallax-container]').length ? $(this).find('[data-parallax-container]') : $(this))
    })
}

function fixHeaderScroll() {
    let header = $('.header')
    let headerRect = header[0].getBoundingClientRect()

    if(headerRect.top < (0 - header.find('.message-marquee').outerHeight())){
        window.scrollTo(0,0)
        setTimeout(function () {
            header.removeClass('is-scrolling')
            header.removeClass('is-hidden')
        }, 25)
    }
}

function blocks() {
    let methods = {
        //main page
        '.s-promo-main': function () {
            setResizeUpdate()
        },
        '.s-featured': function (sections) {
            sections.each(function () {
                let section = $(this)
                let slider = section.find('.swiper')[0]
                let arrowPrev = section.find('.swiper-arrows-prev')[0]
                let arrowNext = section.find('.swiper-arrows-next')[0]

                new Swiper(slider, {
                    slidesPerView: 1,
                    spaceBetween: 16,
                    loop: true,
                    speed: 600,
                    // autoplay: {
                    //     delay: 8000,
                    // },
                    navigation: {
                        nextEl: arrowNext,
                        prevEl: arrowPrev,
                    },
                    breakpoints: {
                        769: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        1081: {
                            slidesPerView: 4,
                            spaceBetween: 36,
                        },
                    }
                })

            })
        },
        '.s-ticker': function (sections) {
            sections.each(function () {
                let section = $(this)
                let headerMessage = section.find('.marquee_offset')
                let durationDesktop = 15000
                let durationMob = 7000

                if(headerMessage.length){
                    let unitContainer = headerMessage.find('.marquee_content')
                    let unit = unitContainer.find('.marquee_unit')
                    let unitWidth = unit.width()
                    let sumWidth = unitWidth

                    while (sumWidth <= headerMessage.width()){
                        unitContainer.append(unit.clone())
                        sumWidth += unitWidth
                    }

                    setTimeout(function () {
                        headerMessage.marquee({
                            direction: 'left',
                            duration: $(window).width() > 768 ? durationDesktop : durationMob,
                            gap: 0,
                            delayBeforeStart: 0,
                            duplicated: true,
                            startVisible: true
                        });
                    }, 1000)
                }
            })
        },
        '.s-occasion': function (section) {
            let allImg = section.find('[data-hover-img]')

            section.find('[data-hover]').on('mouseover', function () {
                if($(window).width() <= 991) return;
                let thisImg = section.find('[data-hover-img="'+$(this).attr('data-hover')+'"]')

                if(!thisImg.length) return;

                allImg.not(thisImg).css('opacity', '0')
                thisImg.css('opacity', '1')

                section.find('.section-img').attr('href', $(this).attr('href'))
            })
        },
        '.s-about-main': function (section) {
            let titles = section.find('.s-about-main__scroller-text__inner>*')

            titles.each(function (){
                new SplitText(this, {
                    type: "words",
                });
            })

            let lines = titles.find('.aki__line')

            function isLineAtCenter(line) {
                let lineRect = line.getBoundingClientRect()
                let windowCenter = window.innerHeight / 2

                if(lineRect.top < windowCenter){
                    return {isCenter: false, isHigher: true, percents: 0};
                } else {
                    if(lineRect.top > windowCenter + lineRect.height)
                        return {isCenter: false, isHigher: false, percents: 0};
                    return {isCenter: true, isHigher: false, percents: (lineRect.height - (lineRect.top - windowCenter)) / lineRect.height};
                }
            }

            scroller.on('scroll', function (e) {
                if(!isElementXPxInViewport(section[0])) return;
                lines.each(function () {
                    let thisLine = $(this)
                    let isCenter = isLineAtCenter(this)
                    if(!isCenter.isCenter) {
                        if(isCenter.isHigher){
                            thisLine.find('.split-char').addClass('act')
                        } else {
                            thisLine.find('.split-char').removeClass('act')
                        }
                        return;
                    }
                    let thisChars = thisLine.find('.split-char')

                    if(e.direction === 'down'){
                        thisLine.prev().find('.split-char').addClass('act')
                        for (let i = 0; i < Math.round(thisChars.length * isCenter.percents); i++){
                            let thisChar = thisChars.eq(i)
                            if(thisChar.length)
                                thisChar.addClass('act')
                        }
                    } else {
                        thisLine.next().find('.split-char').removeClass('act')
                        for (let i = thisChars.length - 1; i > Math.round(thisChars.length * isCenter.percents); i--){
                            let thisChar = thisChars.eq(i)
                            if(thisChar.length)
                                thisChar.removeClass('act')
                        }
                    }
                })
            })
        },
        '.s-testimonials': function (sections) {
            sections.each(function () {
                let section = $(this)
                let slider = section.find('.swiper')[0]
                let arrowPrev = section.find('.swiper-arrows-prev')[0]
                let arrowNext = section.find('.swiper-arrows-next')[0]
                new Swiper(slider, {
                    slidesPerView: 1,
                    spaceBetween: 58,
                    speed: 600,
                    navigation: {
                        nextEl: arrowNext,
                        prevEl: arrowPrev,
                    },
                    breakpoints: {
                        769: {
                            slidesPerView: 2,
                        }
                    }
                })
            })
        },
        '.s-recent': function (sections) {
            sections.each(function () {
                let section = $(this)
                let slider = section.find('.swiper')[0]
                let arrowPrev = section.find('.swiper-arrows-prev')[0]
                let arrowNext = section.find('.swiper-arrows-next')[0]
                new Swiper(slider, {
                    slidesPerView: 1,
                    spaceBetween: 16,
                    speed: 600,
                    navigation: {
                        nextEl: arrowNext,
                        prevEl: arrowPrev,
                    },
                    breakpoints: {
                        769: {
                            slidesPerView: 2,
                            spaceBetween: 0,
                        }
                    }
                })
            })
        },


        //category
        '.s-shop-category': function (sections) {
            sections.each(function () {
                let section = $(this)
                let filterInput = $('.s-shop-category__filter input[name]')
                let cardsContainer = section.find('.s-shop-category__list')
                let $grid = cardsContainer.isotope({
                    itemSelector: '.s-card',
                    percentPosition: true,
                    filter: '*'
                });

                filterInput.each(function () {
                    this.checked = this.defaultChecked;
                })

                function filter() {
                    let filterSelector = ''

                    filterInput.each(function () {
                        if($(this).is(':checked') && this.value !== '' && this.value !== '*')
                            filterSelector += '[data-filter-'+$(this).attr('data-filter-name')+'="'+this.value+'"]'
                    })
                    if(filterSelector === '')
                        filterSelector = '*'

                    $grid.isotope({ filter: filterSelector })

                    if($(filterSelector).length){
                        cardsContainer.removeClass('no-results')
                    } else {
                        cardsContainer.addClass('no-results')
                    }
                    setTimeout(function () {
                        scroller.update()
                        checkScroll()
                    }, 300)
                }

                let accBtns = section.find('.s-shop-category__filter-item')

                function closeFilter(accToClose) {
                    let thisBody = accToClose.find('.s-shop-category__filter-body')
                    thisBody.slideUp(300)
                    accToClose.removeClass('is-open')
                }
                function toggleFilter() {
                    let thisHead = $(this)
                    let accordion = thisHead.closest('li')
                    let thisBody = accordion.find('.s-shop-category__filter-body')

                    thisBody.slideToggle(300)
                    accordion.toggleClass('is-open')

                    setTimeout(function () {
                        scroller.update()
                    }, 300)

                    //to close else
                    // let elseAccordions = accordion.closest('ul').find('.is-open').not(accordion)
                    // closeFilter(elseAccordions)
                }

                accBtns.on('click', toggleFilter)

                filterInput.on('change', filter)
            })

            $(document).on('click', '.s-shop-category__sort-dropdown li', function () {
                let option = $(this)
                let value = option.attr('data-value')
                let text = option.text().trim()
                let container = option.closest('.s-shop-category__sort-dropdown')
                let outValue = container.find('.output_value')
                let outText = container.find('.output_text')

                if(outValue.length)
                    outValue.val(value)
                if(outText.length)
                    outText.text(text)
            })
            dropdown({
                containerClass: 's-shop-category__sort-dropdown',
                btnSelector: '>span',
                closeBtnClass: '',
                dropdownSelector: 'ul',
                effect: 'slide',
                timing: 300
            })
        },

        //product page
        '.s-product': function (section) {
            let mainSlider = $('.s-product__gallery-main .swiper')[0]
            let nextSlider = $('.s-product__gallery-next .swiper')[0]
            let isClicked = false

            let mainSwiper = new Swiper(mainSlider, {
                slidesPerView: 1,
                spaceBetween: 10,
                speed: 600,
                breakpoints: {
                    769: {
                        spaceBetween: 30,
                    },
                }
            })
            let nextSwiper = new Swiper(nextSlider, {
                slidesPerView: 4,
                spaceBetween: 10,
                direction: 'horizontal',
                speed: 600,
                breakpoints: {
                    575: {
                        slidesPerView: 6,
                    },
                    769: {
                        slidesPerView: 5,
                        spaceBetween: 16,
                    },
                    992: {
                        slidesPerView: 'auto',
                        spaceBetween: 20,
                        direction: 'vertical',
                    },
                }
            })

            function setCurrent(index) {
                $(nextSlider).find('.swiper-slide').removeClass('is-current')
                $(nextSlider).find('.swiper-slide').eq(index).addClass('is-current')
            }

            $(nextSlider).find('.swiper-slide').on('click', function () {
                isClicked = true;
                setCurrent($(this).index())
                nextSwiper.slideTo($(this).index())
                mainSwiper.slideTo($(this).index())
                setTimeout(function () {
                    isClicked = false
                },650)
            })

            nextSwiper.params.control = mainSwiper;

            mainSwiper.on('slideChangeTransitionEnd', function (e) {
                if(!isClicked) {
                    setCurrent(e.activeIndex)
                    nextSwiper.slideTo(e.activeIndex)
                }
                checkScroll()
            })

            setCurrent(0)
            setTimeout(function () {
                scroller.update()
            },300)

            function selectMobVariation(e) {
                if($(window).width() > 768) return;
                let option = $(this)
                if(!e['originalEvent'])
                    option = e.closest('li')
                let text = option.text().trim()
                let container = option.closest('.s-shop-category__sort-dropdown')
                let outText = container.find('.output_text')

                if(outText.length)
                    outText.text(text)
            }

            $(document).on('click', '.s-shop-category__sort-dropdown li', selectMobVariation)
            $('.s-product__variations .s-shop-category__sort-dropdown input:checked').each(function () {
                selectMobVariation($(this))
            })
            dropdown({
                containerClass: 's-shop-category__sort-dropdown',
                btnSelector: '>span',
                closeBtnClass: '',
                dropdownSelector: 'ul',
                effect: 'slide',
                timing: 300
            })
        },

        //post
        '.s-promo__bg': function () {
            setResizeUpdate()
        },


        //common
        '.s-accordion': function (accordions) {
            let accBtns = accordions.find('.s-accordion__head')

            function closeAccordions(accToClose) {
                let thisBody = accToClose.find('.s-accordion__body')
                thisBody.slideUp(300)
                accToClose.removeClass('is-open')
            }
            function toggleAccordion() {
                let thisHead = $(this)
                let accordion = thisHead.closest('.s-accordion')
                let thisBody = accordion.find('.s-accordion__body')

                thisBody.slideToggle(300)
                accordion.toggleClass('is-open')

                let stickyUpdate = setInterval(function () {
                    $(document).trigger('update-sticky-bottom')
                }, 10)
                setTimeout(function () {
                    clearInterval(stickyUpdate)
                    scroller.update()
                }, 300)

                //to close else
                let elseAccordions = accordion.closest('.s-accordion-list').find('.s-accordion.is-open').not(accordion)
                closeAccordions(elseAccordions)
            }

            accBtns.on('click', toggleAccordion)
        },
        '.float-btn': function (btn) {
            scroller.on('scroll', function (e) {
                if (e.direction === 'down' || btn.hasClass('s-product__fixed-btn')) {
                    if(!$('.header').hasClass('menu-open') && !$('.header').hasClass('menu-open-search'))
                        btn.addClass('is-active')
                } else {
                    btn.removeClass('is-active')
                }
            })
        },
        '.pointer-cursor': function (cursor) {
            let mouseY = 0;
            let mouseX = 0;
            let style = getComputedStyle(cursor[0]);
            let width = parseInt(style.width.replace('px', '')) / 2
            let height = parseInt(style.height.replace('px', '')) / 2

            if ($(window).width() > windowTablet) {
                !function () {
                    setTimeout(() => {
                        var $follower = cursor[0];
                        var posX = 0;
                        var posY = 0;

                        TweenMax.to({}, 0.01, {
                            repeat: -1,
                            onRepeat: function onRepeat() {
                                let speed = 5;
                                posX += (mouseX - posX) / speed;
                                posY += (mouseY - posY) / speed;
                                TweenMax.set($follower, {
                                    css: {
                                        left: posX,
                                        top: posY
                                    }
                                });
                            }
                        });
                        window.addEventListener('pointermove', function (e) {
                            mouseX = e.clientX - width;
                            mouseY = e.clientY - height;
                        });


                    }, 100)
                }();
            }
        },
        '[data-pointer-area]': function (area) {
            let cursor = $('.pointer-cursor')
            let btns = area.find('.s-button, .s-card__btn, .s-post-card__btn')

            area.hover(
                function () {
                    cursor.find('.pointer-cursor__label').text($(this).attr('data-pointer-area'))
                    cursor.addClass('pointer-cursor--visible')
                },
                function () {
                    cursor.removeClass('pointer-cursor--visible')
                }
            )
            if(!btns.length) return;
            btns.hover(
                function () {
                    cursor.removeClass('pointer-cursor--visible')
                },
                function () {
                    cursor.find('.pointer-cursor__label').text($(this).attr('data-pointer-area'))
                    cursor.addClass('pointer-cursor--visible')
                }
            )
        },
        '[data-scroll-zoom]': function (elements) {
            scroller.on('scroll', function (e) {
                elements.each(function () {
                    if(!isElementXPxInViewport(this)) return;
                    let rect = this.getBoundingClientRect();
                    let thisElScrolled = e.scroll.y - (e.scroll.y + rect.top - window.innerHeight);
                    let thisElScrolledPercent = thisElScrolled / $(this).height()
                    let sensitivity = parseFloat($(this).attr('data-scroll-zoom'))

                    $(this).css('transform', 'scale('+ (thisElScrolledPercent * sensitivity + 1) +')')
                })
            })
            scroller.update()
        },
        '[data-scroll-sticky-bottom]': function (elements) {
            elements.each(function () {
                let element = $(this)
                let parent = element.closest(element.attr('data-scroll-sticky-parent'))
                let paddB = parseFloat(element.attr('data-scroll-sticky-bottom')) || 0.0

                function scrolling() {
                    let top = parent[0].getBoundingClientRect().top
                    let elH = $(element).innerHeight()
                    let parH = $(parent).innerHeight()
                    let windowH = window.innerHeight

                    let calcOff = windowH - (elH+top) - paddB
                    let stickyDistance = (0-top) - (elH-windowH)

                    let reachEnd = parH + paddB <= elH+stickyDistance

                    if(!reachEnd) {
                        if (calcOff >= 0 && top < 0) {
                            element.css('transform', 'translateY(' + calcOff + 'px)')
                        } else {
                            element.css('transform', 'translateY(0)')
                        }
                    } else {
                        element.css('transform', 'translateY(' + (parH - elH) + 'px)')
                    }
                }

                $(document).on('update-sticky-bottom', scrolling)
                scroller.on('scroll', scrolling)
            })
        },
        '.s-button:not(.s-button--round)': function (btns) {
            btns.append('<span class="s-button__bg"></span>')
            btns.hover(
                function () {
                    $(this).addClass('is-hovered')
                },
                function () {
                    $(this).removeClass('is-hovered')
                }
            )
            $(window).on('mousemove', function (e) {
                let activeBtn = $('.s-button.is-hovered')
                if(!activeBtn.length) return;
                let activeBtnRect = activeBtn[0].getBoundingClientRect()
                let activeBtnBg = activeBtn.find('.s-button__bg')

                activeBtnBg.css({
                    'top': e.originalEvent.clientY - activeBtnRect.y,
                    'left': e.originalEvent.clientX - activeBtnRect.x
                })
            })
        },

        '.s-quantity': function () {
            $(document).on('click', '.s-quantity__btn', function (e) {
                e.stopPropagation();
                var o, t = $(this),
                    n = t.siblings("input"),
                    a = parseFloat(n.attr("step")),
                    d = parseFloat(n.attr("max")),
                    m = parseFloat(n.attr("min")) || 0,
                    e = !1,
                    i = "function" == typeof Number.isNaN && Number.isNaN(parseFloat(n.val())) ? i : parseFloat(n.val());
                (e = t.hasClass("btn-minus") ? !0 : e) ? m < (o = i - a) ? n.val(o) : n.val(m): (o = i + a, void 0 !== d && d <= o ? n.val(d) : n.val(o)), n.trigger("change")
            })
        },
        '.s-quantitycart': function () {
            let inpNumber = '.s-quantitycart'
            let inpNumberEl = '.s-quantitycart input'

            let minusBtn = '.s-quantitycart__btn.btn-minus'
            let plusBtn = '.s-quantitycart__btn.btn-plus'


            function loadCart() {
                // Create an XMLHttpRequest object
                const xhttp = new XMLHttpRequest();

                // Define a callback function
                xhttp.onload = function () {
                    // Here you can use the Data
                    jQuery('#cart-items').html(JSON.parse(xhttp.responseText)['cart-items']);
                    $('#cart-items').removeClass('in-process');
                }

                // Send a request
                xhttp.open('GET', '/?sections=cart-items', true);
                xhttp.send();
            }

            function updateCart(empty = false) {
                let quantityPlus = [];
                if (!empty) {
                    $('.s-cart__list .s-quantitycart input').each(function () {
                        quantityPlus.push($(this).val());
                    });
                } else {
                    $('.s-cart__list .s-quantitycart input').each(function () {
                        quantityPlus.push(0);
                    });
                }

                jQuery.post(window.Shopify.routes.root + 'cart/update.js', { updates: quantityPlus }, function (response) {
                    loadCart();
                });
            }

            $(document).on('click', minusBtn, function (e) {
                e.preventDefault();
                let inputEl = $(this).closest(inpNumber).find('input');
                let thisVal = parseInt(inputEl.val());
                inputEl.val(thisVal - 1);

                $('#cart-items').addClass('in-process');
                setTimeout(() => {
                    updateCart();
                }, 500);
            })
            $(document).on('click', '#empty-cart', function (e) {
                e.preventDefault();
                updateCart(true);
            });
            $(document).on('click', plusBtn, function (e) {
                e.preventDefault();
                let inputEl = $(this).closest(inpNumber).find('input');
                let thisVal = parseInt(inputEl.val())
                // if(thisVal < parseInt(inputEl.attr('max'))) {
                inputEl.val(thisVal + 1);
                $('#cart-items').addClass('in-process');
                setTimeout(() => {
                    updateCart();
                }, 500);
                // }
            })
            $(document).on('focusout', inpNumberEl, function () {
                let inputEl = $(this)
                let thisMin = (inputEl.attr('min') && parseInt(inputEl.attr('min')) >= 0) ? parseInt(inputEl.attr('min')) : 1
                let thisMax = (inputEl.attr('max') && parseInt(inputEl.attr('max')) >= thisMin) ? parseInt(inputEl.attr('max')) : false
                let thisVal = parseInt(inputEl.val())

                if (!thisVal)
                    $(this).val(thisMin)
                if (thisVal < thisMin)
                    $(this).val(thisMin)
                if (thisMax && thisVal > thisMax)
                    $(this).val(thisMax)

                setTimeout(() => {
                    updateCart();
                }, 500);
            })
        },
        '.title-animation': function (allTitles) {
                const titles = gsap.utils.toArray('.title-animation>*')

                titles.forEach(title => {
                    let thisItalic = $(title).find('>*')

                    thisItalic.each(function () {
                        if($(this).html())
                            $(this).html($(this).html().replaceAll(' ', '&nbsp;'))
                    })

                    $(title).html($(title).html().replaceAll('.', ' &#160;'))

                    title.split = new SplitText(title, {
                        type: "chars, words",
                    });
                    $(title).find('.split-word').each(function () {
                        let thisWord = $(this)
                        thisItalic.each(function () {
                            if(thisWord.text().toLowerCase().trim() === $(this).text().toLowerCase().trim())
                                thisWord.addClass('style-italic')
                        })
                    })

                    $(title).html($(title).html().replaceAll('&nbsp;', '<span class="split-dot">.</span>'))
                    $(titles).find('.split-dot').each(function () {
                        $(this).closest('.split-word').addClass('no-gap')
                    })
                })

                const chars = gsap.utils.toArray('.split-char')

                function animateTitle(el) {
                    const chars = gsap.utils.toArray('.split-char', el)
                    gsap.fromTo(chars, {
                        yPercent: 150,
                        rotation: 45,
                    }, {
                        duration: 0.3,
                        ease: "circ.out",
                        yPercent: 0,
                        rotation: 0,
                        stagger: 0.03,
                    })
                    setTimeout(function () {
                        $(el).addClass('animation-done')
                    }, 300)
                }

                gsap.set(chars, {
                    yPercent: 150,
                    rotation: 45,
                })

                allTitles.each(function () {
                    if($(this).hasClass('is-inview')){
                        animateTitle(this)
                    }
                })

                $(document).on('call', function (e,t,r) {
                    if($(r).hasClass('animation-going')){
                        return;
                    } else {$(r).addClass('animation-going')
                    }
                    if(t !== 'title-visible') return;

                    animateTitle(r)
                })




        },
        '.message-marquee': function (sections) {
            sections.each(function () {
                let message = $(this).find('.marquee_offset')
                let durationDesktop = 25000
                let durationMob = 10000

                if(message.length){
                    let unitContainer = message.find('.marquee_content')
                    let unit = unitContainer.find('.marquee_unit')
                    let unitWidth = unit.width()
                    let sumWidth = unitWidth + 50

                    while (sumWidth <= message.width()){
                        unitContainer.append(unit.clone())
                        sumWidth += unitWidth + 50
                    }
                    setTimeout(function () {
                        message.marquee({
                            direction: 'left',
                            duration: $(window).width() > 768 ? durationDesktop : durationMob,
                            gap: 0,
                            delayBeforeStart: 0,
                            duplicated: true,
                            startVisible: true
                        });
                    }, 500)
                }
            })
        },
        '.header': function (header) {
            let searchBtn = header.find('.header__search-btn>*')

            searchBtn.on('click', function (e) {
                e.preventDefault()
                if($(window).width() <= 768){
                    return;
                }
                header.find('.header__search-inner').fadeIn(300)
                header.find('.header__search').addClass('is-open')

                header.find('.header__search-inner input').focus()
            })
            $(document).on('click', function (e) {
                let target = $(e.target)

                if(!header.find('.header__search').hasClass('is-open')) return;
                if(target.hasClass('header__search') || target.closest('.header__search').length) return;

                header.find('.header__search-inner').fadeOut(300)
                header.find('.header__search').removeClass('is-open')

                header.find('.header__search-inner input').blur()
            })

            function animateSticky(down = true) {
                if($(window).width() <= 768) return;
                $('[data-scroll-sticky]').each(function () {
                    if(typeof $(this).attr('data-scroll-dont-check') !== 'undefined') return;
                    if((down && this.getBoundingClientRect().top < 5) || !down){
                        let maxSticky = Math.round($(this).closest($(this).attr('data-scroll-target')).height() - $(this).height())
                        let currentSticky = Math.round(parseFloat(this.style['transform'].split(',')[13]) + $('.header').height())
                        if(down && (currentSticky >= maxSticky)) return;
                        $(this).stop().animate({top: down ? header.height() : '0'}, 300)
                    }
                })
            }
            scroller.on('scroll', function (e) {
                if($('.header').hasClass('menu-open') || $('.header').hasClass('menu-open-search')) return;
                if(e.scroll.y > header.height()) {
                    header.addClass('is-scrolling')
                    if (e.direction === 'down') {
                        if(header.hasClass('is-top')) {
                            header.addClass('is-hidden')
                            setTimeout(function () {
                                header.removeClass('is-top')
                            }, 10)
                        } else if(!header.hasClass('is-hidden')) {
                            header.addClass('is-hidden')
                            animateSticky(false)
                        }
                    } else if(header.hasClass('is-hidden')) {
                        animateSticky()
                        header.removeClass('is-hidden')
                    }
                } else {
                    if (e.scroll.y <= $('.header__container').height()) {
                        header.addClass('is-top')
                        header.removeClass('is-scrolling')
                    }
                }
            })
        },
        '.header__mob-menu.header-menu': function (menu) {
            let openBtn = $('.header__burger')
            let animItems = $('.header__mob-menu__nav>ul>li, .header__mob-menu__links>*, .header__mob-menu__bottom')

            menu.css('height', viewportEl.height() - $('.header__container').height())

            function delay(item, prevDelay) {
                setTimeout(() => {
                    item.addClass('is-active')
                }, 100 * prevDelay);
            }

            function toggleMenu() {
                $('.float-btn').removeClass('is-active')

                if($(window).width() > 991){
                    if($('.header').hasClass('is-open')){
                        $('.header').removeClass('menu-open-search')
                        scroller.start()
                        $('html').removeClass('overflow-hidden')
                        menu.removeClass('is-open')
                        openBtn.removeClass('is-open')
                    }

                    return;
                }

                $('.header').removeClass('menu-open-search')
                $('.header__mob-menu.header-search').removeClass('is-open')
                $('.header__search-btn').removeClass('is-open')

                if(menu.hasClass('is-open')){
                    $('.header').removeClass('menu-open').removeClass('is-hidden')
                    scroller.start()
                    $('html').removeClass('overflow-hidden')
                    fixHeaderScroll()
                    setTimeout(() => {
                        animItems.removeClass('is-active')
                    }, 200);
                } else {
                    if($('.header').hasClass('is-scrolling')) {
                        menu.css('height', viewportEl.height() - $('.header__container').height())
                    } else {
                        menu.css('height', viewportEl.height() - $('.header').height())
                    }
                    $('.header').addClass('menu-open')
                    scroller.stop()
                    $('html').addClass('overflow-hidden')
                    setTimeout(function () {
                        animItems.each(function (i) {
                            delay($(this), i+1)
                        })
                    }, 300)

                }

                menu.toggleClass('is-open')
                openBtn.toggleClass('is-open')
            }

            openBtn.on('click', toggleMenu)
            dropdown({
                globalContainer: '.header__mob-menu__nav',
                containerClass: 'has-child',
                btnSelector: '>a',
                closeBtnClass: '',
                dropdownSelector: 'ul',
                effect: 'slide',
                timing: 300
            })
        },
        '.header__mob-menu.header-search': function (menu) {
            let openBtn = $('.header__search-btn')
            let header = $('.header')
            let searchInput = document.getElementById('menu-search-input')

            menu.css('height', viewportEl.height() - $('.header__container').height())

            function toggleMenu() {
                $('.float-btn').removeClass('is-active')

                if($(window).width() > 768){
                    if(menu.hasClass('is-open')){
                        $('.header').removeClass('menu-open-search')
                        scroller.start()
                        $('html').removeClass('overflow-hidden')
                        menu.removeClass('is-open')
                        openBtn.removeClass('is-open')
                    }

                    return;
                }

                header.removeClass('menu-open')
                $('.header__mob-menu.header-menu').removeClass('is-open')
                $('.header__burger').removeClass('is-open')

                menu.toggleClass('is-open')
                openBtn.toggleClass('is-open')

                if(menu.hasClass('is-open')){
                    searchInput.focus();
                    if(header.hasClass('is-scrolling')) {
                        menu.css('height', viewportEl.height() - $('.header__container').height())
                    } else {
                        menu.css('height', viewportEl.height() - header.height())
                    }
                    header.addClass('menu-open-search')
                    scroller.stop()
                    $('html').addClass('overflow-hidden')
                } else {
                    searchInput.blur();
                    header.removeClass('menu-open-search').removeClass('is-hidden')
                    scroller.start()
                    $('html').removeClass('overflow-hidden')

                    fixHeaderScroll()
                }

            }



            openBtn[0].onclick = toggleMenu
        },


        '#sign-up-popup': function () {
            if(getCookie('sign-up-popup')) return;

            setCookie('sign-up-popup', 'true', 10)

            setTimeout(function () {
                $.fancybox.open({
                    'src': '#sign-up-popup'
                })
            }, 10000)
        },
        '.s-quiz': function (popup) {
            let container = popup.find('.s-quiz__container')
            let btnClose = popup.find('.s-quiz__close')
            let btnPrev = popup.find('.s-quiz__bottom-prev')
            let btnNext = popup.find('.s-quiz__bottom-next, .s-quiz__step-skip')
            let btnList = popup.find('.s-quiz__bottom-current ul')
            let steps = popup.find('.s-quiz__step')
            let stepInputs = steps.find('[required]')
            let stepTitles = popup.find('.s-quiz__title>*')
            let stepNum = popup.find('.s-quiz__num')
            let step = 0;
            let lastStep = steps.length - 1;
            let openOnce = true
            let prevHeight = 0

            let twice = 2

            function isFinal() {
                console.log('final step!')
            }

            function validateStep(e = false) {
                let thisStep = steps.eq(step)
                let thisInputs = thisStep.find('[required]')
                let isValid = true;
                let names = []

                thisInputs.each(function () {
                    if($(this).attr('name'))
                        names.push($(this).attr('name'))
                })
                names = names.filter((item, index) => names.indexOf(item) === index);
                names.forEach(function (name) {
                    let thisInput = thisStep.find('[name="'+name+'"]')

                    switch (thisInput.attr('type')){
                        case 'radio':
                        case 'checkbox':
                            let thisValid = false;

                            thisInput.each(function () {
                                if(this.checked)
                                    thisValid = true
                            })
                            if(!thisValid)
                                isValid = false
                        break;
                        default:
                            if(!$(this).val())
                                isValid = false
                        break;
                    }
                })

                if(isValid){
                    if(e)
                        setStepNext()
                    popup.removeClass('is-error')
                } else {
                    if(!openOnce)
                        popup.addClass('is-error')
                }

                return isValid;
            }
            function setStep(index) {
                let isValid = validateStep()
                if(index !== 0 && !isValid) return;
                let animInputsTimeout = 0

                function animateNext() {
                    let nextStep = steps.eq(index)
                    let nextTitle = stepTitles.eq(index)
                    let nextAnimInputs = nextStep.find('.anim-fade')

                    nextStep.show()
                    nextTitle.show()
                    container.css({'transition': 'height .6s ease, transform .5s cubic-bezier(.25,.99,.52,.9)', 'height': 'auto'})
                    let nextHeight = container[0].offsetHeight

                    if(prevHeight)
                        container.css({'height': prevHeight})

                    setTimeout(function () {
                        nextTitle.addClass('is-active')
                        if(prevHeight) {
                            container.css({'height': nextHeight})
                        }
                        setTimeout(function () {
                            container.removeAttr('style')
                        }, 650)
                    }, 50)

                    animInputsTimeout = 0
                    nextAnimInputs.each(function () {
                        let item = $(this)
                        setTimeout(function () {
                            item.addClass('is-active')
                        }, animInputsTimeout)

                        animInputsTimeout += 100
                    })

                    let btnListLi = btnList.first().closest('ul').find('li')

                    btnListLi.removeClass('is-active')
                    btnListLi.eq(step).addClass('is-active')

                    if(step !== 0){
                        btnPrev.fadeIn(300)
                    } else {
                        btnPrev.fadeOut(300)
                    }

                    if(step !== lastStep){
                        popup.find('.s-quiz__bottom-next').fadeIn(300)
                    } else {
                        popup.find('.s-quiz__bottom-next').fadeOut(300)
                    }

                    if(step+1 < 10){
                        stepNum.text('0'+(step+1))
                    } else {
                        stepNum.text(step+1)
                    }
                }
                function resetPrev(prevIndex) {
                    let prevStep = steps.eq(prevIndex)
                    let prevTitle = stepTitles.eq(prevIndex)
                    let prevAnimInputs = prevStep.find('.anim-fade')
                    twice--;
                    prevHeight = container[0].offsetHeight
                    prevStep.hide()
                    prevTitle.removeClass('is-active out-anim').hide()
                    prevAnimInputs.removeClass('is-active out-anim')
                }

                if(!openOnce) {
                    let currTitle = stepTitles.eq(step)
                    let animInputs = steps.eq(step).find('.anim-fade')

                    currTitle.addClass('out-anim')
                    animInputs.each(function () {
                        let item = $(this)
                        setTimeout(function () {
                            item.addClass('out-anim')
                        }, animInputsTimeout)

                        animInputsTimeout += 50
                    })

                    let prevStep = step
                    step = index

                    setTimeout(function () {
                        resetPrev(prevStep)
                        animateNext()
                    }, 250)
                } else {
                    animateNext()
                }


                openOnce = false
            }
            function setStepPrev() {
                if(step-1 >= 0)
                    setStep(step-1)
            }
            function setStepNext() {
                if (step+1 <= steps.length-1) {
                    setStep(step + 1)
                } else {
                    isFinal()
                }
            }


            function openPopup() {
                popup.fadeIn(200)
                setTimeout(function () {
                    popup.addClass('is-open')
                    popup.addClass('was-open')
                    if(openOnce) {
                        setStep(0)
                    }
                },10)
            }
            function closePopup() {
                popup.removeClass('is-open')
                setTimeout(function () {
                    popup.fadeOut(300)
                },200)
            }


            for(let i = 2; i <= lastStep+1; i++){
                let newBtn = btnList.find('li:first-child').clone()
                newBtn.find('.s-arrow-link__ico').html('<span>'+i+'</span><span>'+i+'</span>')
                btnList.append(newBtn)
            }
            btnList = btnList.find('.s-button')
            btnList.first().closest('li').addClass('is-active')

            btnClose.on('click', closePopup)
            btnPrev.on('click', setStepPrev)
            btnNext.on('click', setStepNext)
            // btnList.on('click', function (e) {
            //     e.preventDefault()
            //     let thisIndex = $(this).closest('li').index()
            //     if(thisIndex < step || (thisIndex === step+1 && validateStep()))
            //         setStep(thisIndex)
            // })

            stepInputs.on('change', validateStep)
            $('a[href="take-quiz"]').on('click', function (e) {
                e.preventDefault()
                openPopup()
            })
            $(document).on('click', function (e) {
                let target = $(e.target)

                if((target.hasClass('s-quiz') || !target.closest('.s-quiz__container').length) && !target.closest('[href="take-quiz"]').length)
                    closePopup()
            })
        },
        '#newsletter-form': function() {
            var $form = $('#newsletter-form'),
            $success = $('.footer__success'),
            $error = $('.footer__error');

            function register($form) {
                $form.find('#mc-embedded-subscribe').html('Subscribing...');
                $.ajax({
                    type: 'GET',
                    url: $form.attr('action'),
                    data: $form.serialize(),
                    dataType : 'jsonp',
                    cache: false,
                    jsonp: 'c',
                    contentType: 'application/json; charset=utf-8',
                    error: function(error){
                        $form.hide();
                        $error.css('display', 'flex');
                        $form.find('#mc-embedded-subscribe').html('Subscribe');
                    },
                    success: function(data) {
                        if (data.result != "success") {
                            $error.text(data.msg);
                            $error.css('display', 'flex');
                            $success.css('display', 'none');
                            $form.find('#mc-embedded-subscribe').html('Subscribe');
                        } else {
                            $form.hide();
                            $success.css('display', 'flex');
                            $error.css('display', 'none');
                        }
                    }
                });
            }

            $form.find('input[type="submit"]').on('click', function (e) {
                e.preventDefault();
                register($form);
            });
            
            // on submit, register the form
            $form.submit(function(e){
                e.preventDefault();
                register($form);
            });
        },
        '#newsletter-popup-form': function() {
            var $form = $('#newsletter-popup-form'),
            $success = $('#sign-up-popup .form-message.success'),
            $error = $('#sign-up-popup .form-message.error');

            function register($form) {
                $form.find('#mc-embedded-subscribe').html('Subscribing...');
                $.ajax({
                    type: 'GET',
                    url: $form.attr('action'),
                    data: $form.serialize(),
                    dataType : 'jsonp',
                    cache: false,
                    jsonp: 'c',
                    contentType: 'application/json; charset=utf-8',
                    error: function(error){
                        $form.hide();
                        $error.css('display', 'flex');
                        $form.find('#mc-embedded-subscribe').html('Subscribe');
                    },
                    success: function(data) {
                        if (data.result != "success") {
                            $error.text(data.msg);
                            $error.css('display', 'flex');
                            $success.css('display', 'none');
                            $form.find('#mc-embedded-subscribe').html('Subscribe');
                        } else {
                            $form.hide();
                            $success.css('display', 'flex');
                            $error.css('display', 'none');
                        }
                    }
                });
            }

            $form.find('input[type="submit"]').on('click', function (e) {
                e.preventDefault();
                register($form);
            });
            
            // on submit, register the form
            $form.submit(function(e){
                e.preventDefault();
                register($form);
            });
        },
        '#discount-form': function() {
            // $('#discount-form').submit(function(event) {
            //     event.preventDefault();
            //     var discountCode = $('#discount-code').val();
            //     $.ajax({
            //         type: 'POST',
            //         url: '/cart/update.js',
            //         data: { discount_code: discountCode },
            //         dataType: 'json',
            //         success: function(cart) {
            //             alert('Discount applied successfully!');
            //             // Optional: update the cart's contents and totals on the page
            //             // by calling a separate AJAX request to the /cart.js endpoint
            //         },
            //         error: function(XMLHttpRequest, textStatus) {
            //             alert('Error applying discount code: ' + textStatus);
            //         }
            //     });
            // });
        }
    }



    $.each(methods, function (selector, callback) {
        if($(selector).length)
            callback($(selector))
    })
}

function anchors() {
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault()
        let href = $(this).attr('href');
        let block = $('#'+href.split('#').pop());
        let headerEl = $('.header')

        if(block.length) {
            scroller.scrollTo(block[0]);
        }
    });
}
let dataScroll = $('[data-scroll-call="title-visible"], [data-scroll-call="text-visible"], .s-card[data-scroll]')
function checkScroll() {
    dataScroll.each(function () {
        if(this.classList.contains('is-scrolled') || !isElementXPxInViewport(this)) return;
        this.classList.add('is-scrolled')
        $(document).trigger('call', [this.getAttribute('data-scroll-call'), this])
    })
}
function scrollAnimations() {
    checkScroll()
    scroller.on('scroll', checkScroll)
    scroller.on('call', function (e, r, t) {
        if(e==='is-in-view' && !t.el.classList.contains('is-scrolled'))
            t.el.classList.add('is-scrolled')
    })
}

$(document).ready(function () {
    blocks()
    anchors()
    scrollAnimations()
    parallax($('[data-scroll-section]'))
    setTimeout(function () {
        scroller.update()
    }, 2000)


    $('a[href*="openPopup-"], [class*="openPopup"]').on('click', function (e) {
        e.preventDefault()
        let href = $(this).attr('href');
        let thisPopup;

        if(href) {
            let hrefArr = href.split('-')
            hrefArr.shift()
            hrefArr = hrefArr.join('-')
            thisPopup = hrefArr
        } else {
            thisPopup = Array.from(this.classList).find(className => className.indexOf('openPopup-') === 0).replace('openPopup-', '')
        }

        if(thisPopup){
            e.preventDefault()
        } else {
            return;
        }

        thisPopup = '#'+thisPopup

        $.fancybox.open({
            src: thisPopup,
            type: '',
            opts: {},
        });

    });

});
$(window).on('load', function () {
    scroller.update()
})