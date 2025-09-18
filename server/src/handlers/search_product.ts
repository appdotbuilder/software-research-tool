import { type SearchProductInput, type ResearchAnalysis } from '../schema';

// Mock data representing different product research scenarios
const productDatabase = {
  'react': {
    advantages: [
      'Large ecosystem and community support',
      'Component-based architecture for reusability',
      'Virtual DOM for efficient rendering',
      'Strong corporate backing from Meta',
      'Excellent developer tools and debugging support'
    ],
    disadvantages: [
      'Steep learning curve for beginners',
      'Frequent updates can break compatibility',
      'JSX syntax requires additional build step',
      'Large bundle size for simple applications',
      'Complex state management in large apps'
    ],
    market_analysis: 'React dominates the frontend framework market with over 40% adoption rate among developers. It has strong enterprise adoption and continues to grow in popularity. The framework is particularly strong in single-page applications and has excellent job market demand.',
    sources: [
      'https://github.com/facebook/react',
      'https://stackoverflow.com/questions/tagged/reactjs',
      'https://www.reddit.com/r/reactjs',
      'https://npm-stat.com/charts.html?package=react'
    ],
    confidence_score: 0.92
  },
  'vue': {
    advantages: [
      'Gentle learning curve and beginner-friendly',
      'Excellent documentation and guides',
      'Progressive framework - can be adopted incrementally',
      'Lightweight and fast performance',
      'Built-in state management and routing solutions'
    ],
    disadvantages: [
      'Smaller ecosystem compared to React',
      'Less job market demand',
      'Fewer third-party components available',
      'Limited corporate backing',
      'Smaller community size'
    ],
    market_analysis: 'Vue.js has carved out a solid niche in the frontend ecosystem, particularly popular among developers who want simplicity without sacrificing power. It has strong adoption in Asia and among smaller to medium-sized projects.',
    sources: [
      'https://github.com/vuejs/vue',
      'https://stackoverflow.com/questions/tagged/vue.js',
      'https://www.reddit.com/r/vuejs',
      'https://www.npmjs.com/package/vue'
    ],
    confidence_score: 0.89
  },
  'angular': {
    advantages: [
      'Full-featured framework with everything included',
      'Strong TypeScript support out of the box',
      'Excellent for large enterprise applications',
      'Powerful CLI and development tools',
      'Google backing and long-term support'
    ],
    disadvantages: [
      'Very steep learning curve',
      'Heavyweight for simple applications',
      'Complex architecture can be overkill',
      'Frequent major version changes',
      'Verbose syntax and boilerplate code'
    ],
    market_analysis: 'Angular is the enterprise choice for large-scale applications. While it has lower overall adoption than React, it maintains strong presence in enterprise environments and has stable corporate backing from Google.',
    sources: [
      'https://github.com/angular/angular',
      'https://stackoverflow.com/questions/tagged/angular',
      'https://www.reddit.com/r/angular',
      'https://angular.io/guide/releases'
    ],
    confidence_score: 0.87
  }
};

export const searchProduct = async (input: SearchProductInput): Promise<ResearchAnalysis> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

    const productName = input.product_name.toLowerCase().trim();
    
    // Check if we have specific data for this product
    const productData = productDatabase[productName as keyof typeof productDatabase];
    
    if (productData) {
      return {
        product_name: input.product_name,
        advantages: productData.advantages,
        disadvantages: productData.disadvantages,
        market_analysis: productData.market_analysis,
        sources: productData.sources,
        confidence_score: productData.confidence_score
      };
    }

    // Generate generic analysis for unknown products
    const genericAdvantages = [
      'Active development and updates',
      'Community support available',
      'Documentation exists',
      'Open source or commercial backing'
    ];

    const genericDisadvantages = [
      'Limited information available',
      'Smaller community compared to major tools',
      'Potential learning curve',
      'May have compatibility limitations'
    ];

    // Calculate confidence score based on product name characteristics
    let confidenceScore = 0.5; // Base score for unknown products
    
    // Increase confidence if product name looks legitimate
    if (productName.length >= 3 && /^[a-zA-Z][a-zA-Z0-9\-_.]*$/.test(productName)) {
      confidenceScore += 0.2;
    }
    
    // Decrease confidence for very short or suspicious names
    if (productName.length < 2 || /\d{4,}/.test(productName)) {
      confidenceScore -= 0.1;
    }

    // Ensure confidence is within bounds
    confidenceScore = Math.max(0.1, Math.min(0.8, confidenceScore));

    return {
      product_name: input.product_name,
      advantages: genericAdvantages,
      disadvantages: genericDisadvantages,
      market_analysis: `Limited market analysis available for ${input.product_name}. This appears to be a less commonly discussed product in major developer communities. Further research would be needed to provide detailed market insights.`,
      sources: [
        `https://github.com/search?q=${encodeURIComponent(productName)}`,
        `https://stackoverflow.com/search?q=${encodeURIComponent(productName)}`,
        `https://www.reddit.com/search/?q=${encodeURIComponent(productName)}`
      ],
      confidence_score: confidenceScore
    };

  } catch (error) {
    console.error('Product search failed:', error);
    throw error;
  }
};