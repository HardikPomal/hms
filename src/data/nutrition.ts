export type NutritionCategory =
  | "lowHemoglobin"
  | "fatigue"
  | "lowAppetite"
  | "hydration"
  | "recovery"
  | "protein";

export interface NutritionItem {
  id: string;
  name: string;
  nameGu: string;
  emoji: string;
  categories: NutritionCategory[];
  benefits: string;
  benefitsGu: string;
  preparation: string;
  preparationGu: string;
  whenToEat: string;
  whenToEatGu: string;
}

export const NUTRITION_DATA: NutritionItem[] = [
  {
    id: "1",
    name: "Moong Dal Soup",
    nameGu: "મગની દાળનો સૂપ",
    emoji: "🍲",
    categories: ["lowHemoglobin", "recovery", "protein"],
    benefits: "Easy to digest. Rich in protein and iron. Helps rebuild strength after chemotherapy.",
    benefitsGu: "સહેલાઈથી પચી જાય છે. પ્રોટીન અને આયર્નથી ભરપૂર. કીમોથેરાપી પછી તાકાત પાછી લાવવામાં મદદ કરે છે.",
    preparation: "Boil 2 tbsp moong dal in 2 cups water until soft. Add turmeric and a pinch of salt. Strain and serve warm as soup, or eat thick as dal.",
    preparationGu: "2 કપ પાણીમાં 2 ચમચી મગની દાળ નરમ થાય ત્યાં સુધી ઉકાળો. હળદર અને ચપટી મીઠું ઉમેરો. ગાળીને ગરમ સૂપ તરીકે પીઓ, અથવા દાળ તરીકે ખાઓ.",
    whenToEat: "Morning or as lunch. Good after chemotherapy sessions.",
    whenToEatGu: "સવારે અથવા બપોરે. કીમોથેરાપી પછી ઉત્તમ.",
  },
  {
    id: "2",
    name: "Coconut Water",
    nameGu: "નાળિયેર પાણી",
    emoji: "🥥",
    categories: ["hydration", "fatigue", "recovery"],
    benefits: "Natural electrolytes. Prevents dehydration. Easy on the stomach. Helps with nausea.",
    benefitsGu: "કુદરતી ઇલેક્ટ્રોલાઇટ્સ. ડિહાઇડ્રેશન અટકાવે છે. પચવામાં સરળ. ઉબકા મટાડવામાં મદદ કરે છે.",
    preparation: "Drink fresh coconut water directly. Best consumed within an hour of opening.",
    preparationGu: "તાજું નાળિયેર પાણી સીધું જ પીઓ. નાળિયેર ખોલ્યાના 1 કલાકમાં પી લેવું શ્રેષ્ઠ છે.",
    whenToEat: "Morning on empty stomach or between meals. Avoid at night.",
    whenToEatGu: "સવારે ખાલી પેટે અથવા ભોજન વચ્ચે. રાત્રે પીવાનું ટાળો.",
  },
  {
    id: "3",
    name: "Banana Smoothie",
    nameGu: "કેળાની સ્મૂધી",
    emoji: "🍌",
    categories: ["lowAppetite", "fatigue", "protein"],
    benefits: "Quick energy. Rich in potassium. Easy to swallow. Good when solid food is difficult.",
    benefitsGu: "ઝડપી ઊર્જા આપે છે. પોટેશિયમથી ભરપૂર. ગળવામાં સરળ. જ્યારે નક્કર ખોરાક ખાવો મુશ્કેલ હોય ત્યારે ઉત્તમ.",
    preparation: "Blend 1 ripe banana with 1 cup warm milk (or almond milk). Add 1 tsp honey if needed. Avoid ice — serve at room temperature.",
    preparationGu: "1 પાકું કેળું અને 1 કપ ગરમ દૂધ (અથવા બદામનું દૂધ) મિક્સરમાં પીસી લો. જરૂર હોય તો 1 ચમચી મધ ઉમેરો. બરફ નાખશો નહીં - સામાન્ય તાપમાને જ પીઓ.",
    whenToEat: "Morning or as a mid-day snack. Good when appetite is low.",
    whenToEatGu: "સવારે અથવા બપોરના નાસ્તામાં. ભૂખ ઓછી હોય ત્યારે ખૂબ સારું.",
  },
  {
    id: "4",
    name: "Khichdi (Rice & Lentil Porridge)",
    nameGu: "ખીચડી",
    emoji: "🍚",
    categories: ["recovery", "fatigue", "lowAppetite"],
    benefits: "Soft, easy to eat. Complete balanced meal. Gentle on stomach. Easy to digest during treatment.",
    benefitsGu: "નરમ અને ખાવામાં સરળ. સંપૂર્ણ સંતુલિત આહાર. પેટ માટે હળવો. સારવાર દરમિયાન પચવામાં સરળ.",
    preparation: "Cook ½ cup rice with ¼ cup moong dal in 3 cups water until very soft. Add ghee, turmeric, cumin and a little salt.",
    preparationGu: "અડધો કપ ચોખા અને પા કપ મગની દાળ 3 કપ પાણીમાં એકદમ નરમ થાય ત્યાં સુધી રાંધો. તેમાં ઘી, હળદર, જીરું અને થોડું મીઠું ઉમેરો.",
    whenToEat: "Lunch or dinner. Especially good on days following chemotherapy.",
    whenToEatGu: "બપોરે અથવા રાત્રે. કીમોથેરાપી પછીના દિવસોમાં વિશેષ લાભદાયી.",
  },
  {
    id: "5",
    name: "Pomegranate Juice",
    nameGu: "દાડમનો રસ",
    emoji: "🍎",
    categories: ["lowHemoglobin", "recovery"],
    benefits: "Rich in iron and antioxidants. Helps increase hemoglobin. Boosts immunity.",
    benefitsGu: "આયર્ન અને એન્ટીઑકિસડન્ટથી ભરપૂર. હિમોગ્લોબિન વધારવામાં મદદ કરે છે. રોગપ્રતિકારક શક્તિ વધારે છે.",
    preparation: "Extract juice from fresh pomegranate seeds. Do not add sugar. Drink fresh immediately.",
    preparationGu: "તાજા દાડમના દાણામાંથી રસ કાઢો. ખાંડ ઉમેરશો નહીં. તાજો કાઢેલો રસ તરત જ પી લો.",
    whenToEat: "Morning or early afternoon. Do not drink at night.",
    whenToEatGu: "સવારે અથવા બપોરે વહેલા. રાત્રે પીવો નહીં.",
  },
  {
    id: "6",
    name: "Lauki (Bottle Gourd) Soup",
    nameGu: "દૂધીનો સૂપ",
    emoji: "🥬",
    categories: ["hydration", "recovery", "lowAppetite"],
    benefits: "Very easy to digest. High water content. Cooling effect. Good for kidneys.",
    benefitsGu: "પચવામાં ખૂબ જ સરળ. પાણીનું પ્રમાણ વધુ હોય છે. શરીરમાં ઠંડક આપે છે. કિડની માટે સારું છે.",
    preparation: "Peel and chop bottle gourd. Pressure cook with cumin and turmeric. Blend smooth. Serve warm.",
    preparationGu: "દૂધીની છાલ કાઢીને ટુકડા કરો. જીરું અને હળદર સાથે કૂકરમાં રાંધો. મિક્સરમાં એકદમ લીસું પીસી લો. ગરમ પીરસો.",
    whenToEat: "Any time. Especially good as evening snack or light dinner.",
    whenToEatGu: "ગમે ત્યારે. ખાસ કરીને સાંજના નાસ્તામાં અથવા હળવા રાત્રિભોજન તરીકે શ્રેષ્ઠ.",
  },
  {
    id: "7",
    name: "Spinach & Lentil Soup",
    nameGu: "પાલક અને દાળનો સૂપ",
    emoji: "🥬",
    categories: ["lowHemoglobin", "protein"],
    benefits: "Very high in iron and folate. Helps improve hemoglobin. Provides protein and B-vitamins.",
    benefitsGu: "આયર્ન અને ફોલેટથી ભરપૂર. હિમોગ્લોબિન સુધારવામાં મદદ કરે છે. પ્રોટીન અને બી-વિટામિન્સ પૂરા પાડે છે.",
    preparation: "Cook red lentils until soft. Add fresh spinach in last 5 minutes. Season with turmeric, garlic, and lemon juice.",
    preparationGu: "લાલ દાળ (મસૂરની દાળ) નરમ થાય ત્યાં સુધી રાંધો. છેલ્લી 5 મિનિટમાં તાજી પાલક ઉમેરો. હળદર, લસણ અને લીંબુનો રસ ઉમેરો.",
    whenToEat: "Lunch or dinner. Best eaten warm.",
    whenToEatGu: "બપોરે અથવા રાત્રે. ગરમ ખાવું શ્રેષ્ઠ છે.",
  },
  {
    id: "8",
    name: "Yogurt (Curd) with Honey",
    nameGu: "દહીં અને મધ",
    emoji: "🥛",
    categories: ["protein", "recovery", "lowAppetite"],
    benefits: "Probiotics for gut health. Easy protein source. Good during antibiotic treatment.",
    benefitsGu: "પેટના સ્વાસ્થ્ય માટે પ્રોબાયોટીક્સ. પ્રોટીનનો સરળ સ્ત્રોત. એન્ટિબાયોટિક સારવાર દરમિયાન ખૂબ સારું.",
    preparation: "Take fresh plain yogurt at room temperature. Add 1 tsp honey. Do not add ice or serve cold.",
    preparationGu: "સામાન્ય તાપમાને રાખેલું તાજું દહીં લો. તેમાં 1 ચમચી મધ ઉમેરો. બરફ ઉમેરશો નહીં અથવા ઠંડુ ખાશો નહીં.",
    whenToEat: "After meals. Avoid at night or when having fever.",
    whenToEatGu: "ભોજન પછી. રાત્રે અથવા તાવ હોય ત્યારે ટાળો.",
  },
  {
    id: "9",
    name: "Almond Milk",
    nameGu: "બદામનું દૂધ",
    emoji: "🥤",
    categories: ["protein", "fatigue", "lowAppetite"],
    benefits: "Plant-based protein. Easy to digest. Good alternative to regular milk if stomach is sensitive.",
    benefitsGu: "પ્લાન્ટ-આધારિત પ્રોટીન. પચવામાં સરળ. જો પેટ સંવેદનશીલ હોય તો સામાન્ય દૂધનો સારો વિકલ્પ છે.",
    preparation: "Soak 10 almonds overnight. Peel and blend with 1 cup warm water. Strain and drink warm with a pinch of turmeric.",
    preparationGu: "10 બદામ આખી રાત પલાળી રાખો. છોલીને 1 કપ ગરમ પાણી સાથે મિક્સરમાં પીસી લો. ગાળીને ચપટી હળદર સાથે ગરમ પીઓ.",
    whenToEat: "Morning or before sleep. Good as a light evening drink.",
    whenToEatGu: "સવારે અથવા સૂતા પહેલાં. સાંજના હળવા પીણા તરીકે સારું.",
  },
  {
    id: "10",
    name: "Warm Lemon Water with Ginger",
    nameGu: "ગરમ લીંબુ-આદુ પાણી",
    emoji: "🍋",
    categories: ["hydration", "lowAppetite", "fatigue"],
    benefits: "Helps with nausea and nausea from chemotherapy. Aids digestion. Keeps body hydrated.",
    benefitsGu: "કીમોથેરાપીના કારણે થતા ઉબકા અને ઊલટીમાં રાહત આપે છે. પાચનમાં મદદ કરે છે. શરીરને હાઇડ્રેટેડ રાખે છે.",
    preparation: "Squeeze half lemon into 1 cup warm (not boiling) water. Add a thin slice of fresh ginger. Sip slowly.",
    preparationGu: "1 કપ ગરમ (ઊકળતા નહીં) પાણીમાં અડધું લીંબુ નીચોવો. તાજા આદુનો એક પાતળો ટુકડો ઉમેરો. ધીમે ધીમે પીઓ.",
    whenToEat: "Morning before breakfast. Or when feeling nauseous.",
    whenToEatGu: "સવારે નાસ્તા પહેલાં. અથવા જ્યારે ઉબકા આવતા હોય ત્યારે.",
  },
];
