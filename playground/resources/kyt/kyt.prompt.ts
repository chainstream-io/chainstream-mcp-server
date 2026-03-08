import { Injectable, Scope } from '@nestjs/common';
import { z } from 'zod';
import { Prompt } from '../../../dist';

@Injectable({ scope: Scope.REQUEST })
export class KytPrompt {
  @Prompt({
    name: 'kyt-risk-assessment-guide',
    description: 'Guide for performing KYT risk assessment on transfers, withdrawals, and addresses.',
    parameters: z.object({
      assessmentType: z
        .enum(['transfer', 'withdrawal', 'address'])
        .describe('Type of KYT assessment'),
    }),
  })
  getKytRiskAssessmentGuide({ assessmentType }) {
    const guides = {
      transfer: `To assess transfer risk:
1. Register the transfer using registerTransfer with network, asset, and transaction reference
2. Get the transfer summary using getTransferSummary
3. Check for alerts using getTransferAlerts
4. Review direct exposure using getTransferDirectExposure
5. Check network identifications using getTransferNetworkIdentifications`,
      withdrawal: `To assess withdrawal risk:
1. Register the withdrawal using registerWithdrawal with network, asset, transaction reference, and destination address
2. Get the withdrawal summary using getWithdrawalSummary
3. Check for alerts using getWithdrawalAlerts
4. Review fraud assessment using getWithdrawalFraudAssessment
5. Check address identifications using getWithdrawalAddressIdentifications
6. Review direct exposure and network identifications`,
      address: `To assess address risk:
1. Register the address using registerAddress with network and address
2. Get the address risk assessment using getAddressRisk
3. Review the risk level, cluster information, and exposure details`,
    };

    return {
      description: 'KYT risk assessment guide',
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: `How do I perform a KYT ${assessmentType} risk assessment?` },
        },
        {
          role: 'assistant',
          content: { type: 'text', text: guides[assessmentType] },
        },
      ],
    };
  }
}
