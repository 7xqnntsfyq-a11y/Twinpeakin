type MBTIAnswer = string;

export interface MBTIResponses {
  [key: string]: MBTIAnswer;
}

export interface MBTIResult {
  coreMbti: string;
  fieldMbti: string;
  confidence: number;
}

export class MBTIDetector {
  static inferMBTI(responses: MBTIResponses): MBTIResult {
    const scores = {
      E: 0,
      I: 0,
      S: 0,
      N: 0,
      T: 0,
      F: 0,
      J: 0,
      P: 0,
    };

    for (const [questionId, answer] of Object.entries(responses)) {
      const lowerAnswer = answer.toLowerCase();

      if (questionId === "EvsI_energy" || questionId === "stress_core" || questionId === "identity_anchor") {
        if (lowerAnswer.includes("alone") || lowerAnswer.includes("withdraw") || lowerAnswer.includes("quiet") || lowerAnswer.includes("i")) {
          scores.I += 1;
        } else if (lowerAnswer.includes("others") || lowerAnswer.includes("act") || lowerAnswer.includes("motion") || lowerAnswer.includes("e")) {
          scores.E += 1;
        }
      }

      if (questionId === "SvsN_info" || questionId === "pattern_depth") {
        if (lowerAnswer.includes("facts") || lowerAnswer.includes("specifics") || lowerAnswer.includes("s")) {
          scores.S += 1;
        } else if (lowerAnswer.includes("patterns") || lowerAnswer.includes("abstract") || lowerAnswer.includes("n")) {
          scores.N += 1;
        }
      }

      if (questionId === "TvsF_judgment" || questionId === "conflict_style") {
        if (lowerAnswer.includes("logic") || lowerAnswer.includes("principle") || lowerAnswer.includes("t")) {
          scores.T += 1;
        } else if (lowerAnswer.includes("values") || lowerAnswer.includes("relationship") || lowerAnswer.includes("f")) {
          scores.F += 1;
        }
      }

      if (questionId === "JvsP_structure" || questionId === "time_pref" || questionId === "lead_mode") {
        if (lowerAnswer.includes("planned") || lowerAnswer.includes("structure") || lowerAnswer.includes("coordinator") || lowerAnswer.includes("j")) {
          scores.J += 1;
        } else if (lowerAnswer.includes("flexible") || lowerAnswer.includes("adaptive") || lowerAnswer.includes("improviser") || lowerAnswer.includes("p")) {
          scores.P += 1;
        }
      }
    }

    const coreType = 
      (scores.I > scores.E ? "I" : "E") +
      (scores.N > scores.S ? "N" : "S") +
      (scores.F > scores.T ? "F" : "T") +
      (scores.P > scores.J ? "P" : "J");

    const fieldType =
      (scores.E > scores.I ? "E" : "I") +
      (scores.S > scores.N ? "S" : "N") +
      (scores.T > scores.F ? "T" : "F") +
      (scores.J > scores.P ? "J" : "P");

    const totalQuestions = Object.keys(responses).length;
    const confidence = totalQuestions >= 12 ? 0.85 : totalQuestions >= 8 ? 0.75 : 0.6;

    return {
      coreMbti: coreType,
      fieldMbti: fieldType,
      confidence,
    };
  }
}
