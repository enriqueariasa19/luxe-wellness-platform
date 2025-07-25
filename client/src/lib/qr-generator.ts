export function generateQRData(membershipId: string, userId: string): string {
  return JSON.stringify({
    membershipId,
    userId,
    timestamp: Date.now(),
    type: 'luxe-wellness-membership'
  });
}

export function generateQRCodeSVG(data: string, size: number = 100): string {
  // Simple QR code representation as SVG
  // In a real app, you'd use a proper QR code library
  const gridSize = 8;
  const cellSize = size / gridSize;
  
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Generate a simple pattern based on the data hash
  const hash = simpleHash(data);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if ((hash + i * gridSize + j) % 3 === 0) {
        svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function generateWalletPassData(membership: any, user: any) {
  return {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.luxewellness.membership",
    serialNumber: membership.id,
    teamIdentifier: "LUXE_WELLNESS",
    organizationName: "Luxe Wellness",
    description: `${membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)} Membership`,
    logoText: "Luxe Wellness",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: membership.tier === 'gold' ? "rgb(212, 175, 55)" : 
                     membership.tier === 'platinum' ? "rgb(26, 26, 26)" : 
                     "rgb(139, 115, 85)",
    storeCard: {
      headerFields: [
        {
          key: "tier",
          label: "Membership",
          value: membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)
        }
      ],
      primaryFields: [
        {
          key: "balance",
          label: "Balance",
          value: `$${membership.balance} ${membership.currency}`,
          currencyCode: membership.currency
        }
      ],
      secondaryFields: [
        {
          key: "discount",
          label: "Discount",
          value: `${membership.discountPercentage}%`
        },
        {
          key: "vipEvents",
          label: "VIP Events",
          value: membership.vipEventsRemaining.toString()
        }
      ],
      auxiliaryFields: [
        {
          key: "member",
          label: "Member",
          value: `${user.firstName} ${user.lastName}`
        }
      ],
      backFields: [
        {
          key: "terms",
          label: "Terms and Conditions",
          value: "This membership is valid for 12 months from the date of purchase. Funds are only usable at Luxe Wellness clinic locations."
        }
      ]
    },
    barcode: {
      message: generateQRData(membership.id, user.id),
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1"
    }
  };
}
