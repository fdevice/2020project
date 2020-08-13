import { transition, trigger, style, animate, state } from '@angular/animations';

export function fadeInBottom() {
    return trigger('fadeInBottom', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(10%)' }),
            animate('.6s ease-in-out')
        ])
    ])
}


export function fadeInRight() {
    return trigger('fadeInRight', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(10%)' }),
            animate('.6s ease-in-out')
        ])
    ])
}

export function fadeInLeft() {
    return trigger('fadeInLeft', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(-10%)' }),
            animate('.6s ease-in-out')
        ])
    ])
}

export function fadeInTop() {
    return trigger('fadeInTop', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(-10%)' }),
            animate('.6s ease-in-out')
        ])
    ])
}

export function sidetipFadeIn() {
  return trigger('sidetipFadeIn', [
      state('void', style({})),
      state('*', style({})),
      transition(':enter', [
          style({ opacity: 0, transform: 'translateX(15%)' }),
          animate('.7s ease-in-out')
      ])
  ])
}

export function toptipFadeIn() {
  return trigger('toptipFadeIn', [
      state('void', style({})),
      state('*', style({})),
      transition(':enter', [
          style({ opacity: 0, transform: 'translateY(-15%)' }),
          animate('.7s ease-in-out')
      ])
  ])
}

