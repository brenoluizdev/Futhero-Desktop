export interface AdContent {
  id: string;
  title: string;
  message: string;
  buttons: AdButton[];
  image?: string;
  qrCode?: string;
}

export interface AdButton {
  text: string;
  url?: string;
  action?: string;
  style?: 'primary' | 'secondary';
}

export const DONATION_CONFIG = {
  paypalMe: 'https://www.paypal.com/donate/?business=N6M4ZRVYH92JE&no_recurring=0&item_name=Ajude+o+projeto+a+continuar+evoluindo+%E2%80%94+fa%C3%A7a+uma+doa%C3%A7%C3%A3o%21&currency_code=BRL',
  qrCodePath: 'assets/images/donate_qr.png',
  kofi: 'https://ko-fi.com/brenoluizdev'
};

export const ADS_CONTENT: AdContent[] = [
  {
    id: 'donate',
    title: '💝 Apoie o Projeto',
    message: 'Ajude a manter o Futhero Launcher vivo! Sua doação faz toda a diferença.',
    buttons: [
      { 
        text: '💳 Doar via PayPal', 
        url: DONATION_CONFIG.paypalMe,
        style: 'primary' 
      },
      { 
        text: '📱 Ver QR Code', 
        action: 'show-qr', 
        style: 'secondary' 
      },
    ]
  },
  {
    id: 'discord',
    title: '🎮 Entre na Nossa Comunidade',
    message: 'Junte-se a milhares de jogadores no nosso servidor do Discord! Participe de eventos, torneios e conheça outros jogadores.',
    buttons: [
      { 
        text: 'Entrar no Discord', 
        url: 'https://discord.gg/qRJ4UCMfja',
        style: 'primary' 
      }
    ]
  },
  {
    id: 'github',
    title: '⭐ Contribua no GitHub',
    message: 'Dê uma estrela e fork o projeto! Ajude outros jogadores a conhecerem o Futhero Launcher.',
    buttons: [
      { 
        text: '⭐ Dar Estrela', 
        url: 'https://github.com/brenoluizdev/Futhero-Desktop', 
        style: 'primary' 
      },
      { 
        text: '🔱 Fork o Projeto', 
        url: 'https://github.com/brenoluizdev/Futhero-Desktop/fork', 
        style: 'secondary' 
      },
      {
        text: '🐛 Reportar Bug',
        url: 'https://github.com/brenoluizdev/Futhero-Desktop/issues',
        style: 'secondary'
      }
    ]
  }
];

export function getRandomAd(): AdContent {
  return ADS_CONTENT[Math.floor(Math.random() * ADS_CONTENT.length)];
}