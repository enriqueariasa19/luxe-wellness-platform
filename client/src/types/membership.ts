export interface MembershipTier {
  name: 'silver' | 'gold' | 'platinum';
  price: number;
  currency: string;
  discount: number;
  vipEvents: number;
  benefits: string[];
  welcomeGifts: string[];
}

export const MEMBERSHIP_TIERS: Record<string, MembershipTier> = {
  silver: {
    name: 'silver',
    price: 12000,
    currency: 'MXN',
    discount: 5,
    vipEvents: 1,
    benefits: [
      '5% off all services',
      '5% off non-medical retail products',
      'Access to exclusive member-only promotions',
      '1 annual VIP event access'
    ],
    welcomeGifts: [
      '1 complimentary skincare product (based on skin type)'
    ]
  },
  gold: {
    name: 'gold',
    price: 20000,
    currency: 'MXN',
    discount: 10,
    vipEvents: 2,
    benefits: [
      '10% off all services',
      '10% off non-medical retail products',
      'Priority booking',
      '2 annual VIP event accesses'
    ],
    welcomeGifts: [
      '1 skincare product',
      '1 personalized facial treatment'
    ]
  },
  platinum: {
    name: 'platinum',
    price: 30000,
    currency: 'MXN',
    discount: 15,
    vipEvents: 999,
    benefits: [
      '15% off all services',
      '15% off non-medical retail products',
      'Exclusive member-only promotions',
      'Priority booking',
      'Guaranteed invitation to all VIP events'
    ],
    welcomeGifts: [
      '1 skincare product',
      '1 premium personalized facial',
      '1 laser facial (chosen from selected options)'
    ]
  }
};
