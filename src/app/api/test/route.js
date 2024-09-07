import {
    Message as VercelChatMessage,
    StreamingTextResponse,
    createStreamDataTransformer
} from 'ai';
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

export const dynamic = 'force-dynamic'

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `
You are a medical assistant. Only answer questions that are related to medical topics.

first of all check the context if the answer available in the context then gave the answer from the context otherwise provide asnwer your self
Please provide answers in markdown format. and  Present the information clearly gave space or line break

context = Gastroenteritis
• Symptoms:
o Abdominal pain
o Nausea
o Vomiting
o Loose stool
• Diagnosis:
o Based on symptoms: abdominal pain, nausea, vomiting, and loose stool are key
indicators.
• Treatment Plan:
1. Tablets Ciprofloxacin 500mg: Take twice daily for 7 days to treat the underlying infection.
2. Tablets Maxolon 10mg: Take as needed to manage vomiting.
3. Oral Rehydration Solution (ORS): Drink 2 liters per day to prevent dehydration.
4. Smecta Sachet: Take twice daily to soothe the digestive tract.
5. Capsule Risek 40mg: Take once daily to reduce stomach acid.
Urinary Tract Infection (UTI)
• Symptoms:
o Abdominal pain
o Burning sensation during urination (burning micturition)
o Painful urination (dysuria)
• Diagnosis:
o Symptoms such as burning during urination and dysuria suggest a UTI.
• Treatment Plan:
1. Tablets Nitrofurantoin 100mg: Take twice daily for 5 days to clear the infection.
2. Cran-Mac Sachet: Take twice daily to support urinary tract health.
3. Oral Hydration: Drink plenty of water to help flush out the infection.
Dengue Fever
• Symptoms:
o High-grade fever
o Body pain
o Fatigue
o Red spots on the skin (petechiae) may occur
o Occasional abdominal pain
o Dehydration symptoms
• Diagnosis:
o High-grade fever and body pain, especially with dehydration and red spots, indicate
dengue.
• Treatment Plan:
1. Increase Oral Hydration: Drink plenty of fluids to combat dehydration.
2. Symptomatic Treatment: Use painkillers like Panadol for pain relief.
3. Tablets Folic Acid 5mg: Take once daily to support overall health.
4. Multivitamins: Take to support the immune system.
Malaria
• Symptoms:
o High-grade fever with rigors (shivering) and chills
• Diagnosis:
o A history of fever with shivering and chills may indicate malaria.
• Treatment Plan:
o Type-Specific Treatment: Treatment should be tailored according to the specific type
of malaria (there are 4 types).
o Supportive Care: Ensure adequate hydration and symptomatic relief as per the
diagnosis.
Migraine
• Symptoms:
o One-sided headache
o Nausea and/or vomiting
o Sensitivity to light (photophobia)
o Sensitivity to sound (phonophobia)
• Diagnosis:
o A history of one-sided headaches with nausea and sensitivity to light/sound suggests
migraine.
• Treatment Plan:
1. Tablets Synflex-M: Take as needed when experiencing a migraine.
2. Prophylactic Treatment: For prevention:
▪ Tablets Propranolol 10mg: Take twice daily to prevent migraines.
▪ Tablets Topiramate 25mg: Take twice daily as an alternative for prevention.
Upper Respiratory Tract Infection (URTI)
• Symptoms:
o Cough
o Fever
o Sore throat
o Throat pain
• Diagnosis:
o The presence of a cough, sore throat, and fever indicates a possible URTI.
• Treatment Plan:
1. Tablets Augmentin 1g: Take twice daily for 5 days to treat the infection.
2. Tablets Ansaid: Take twice daily to reduce inflammation and pain.
3. Disprin Gargle: Use as directed to soothe the throat.
Pneumonia
• Symptoms:
o Fever
o Cough with sputum production
o Chest pain
o Abnormal findings on a chest X-ray
• Diagnosis:
o Fever, cough with sputum, and chest pain, combined with abnormal chest X-ray
results, suggest pneumonia.
• Treatment Plan:
1. Azomax 500mg: Take once daily for 5 to 7 days to treat the infection.
2. Tablets Klaracid 500mg: Take twice daily for 5 to 7 days as an alternative antibiotic.
3. Tablets Panadol: Take for fever reduction.
4. Capsule Risek 40mg: Take once daily to protect the stomach lining.
5. For Tonsillitis Symptoms: If present:
▪ Tablets Klaracid 500mg: Take twice daily.
▪ Tablets Augmentin 1g: Take twice daily.
▪ Tablets Ansaid: Take twice daily.
Meningitis
• Symptoms:
o High-grade fever
o Neck stiffness (rigidity)
o Occasional seizures (fits)
• Diagnosis:
o Diagnosis is confirmed through a lumbar puncture (spinal tap).
• Treatment Plan:
o Injections Ceftriaxone and Vancomycin: Administer if bacterial meningitis is
confirmed.
o Injections Acyclovir: Administer if viral meningitis is suspected.
o Anti-Tuberculosis Drugs: Administer if meningitis is due to tuberculosis.
Asthma
• Symptoms:
o Episodic shortness of breath
o Cough and sputum production
o History of allergies (e.g., flowers, perfumes, food spices, dust)
o Symptoms worsen with seasonal changes
• Diagnosis:
o Episodic symptoms with a history of allergies and seasonal variation suggest asthma.
• Treatment Plan:
1. Inhalers Foster 100/6mcg: Use twice daily with a spacer (starting dose).
2. Tablets Myteka 10mg: Take as prescribed.
3. Anti-Allergy Medication:
▪ Tablets Telfast 60mg: Take as needed.
▪ Tablets Softin 10mg: Alternative option for allergy management.
4. Tablets Augmentin 1g: Take twice daily for 5 to 7 days if infection is present.
5. Ventolin Inhaler: Use on an SOS basis for acute symptoms.
6. Nebulization: Use Ventolin or Ipnib as prescribed for more severe symptoms.
Chronic Obstructive Pulmonary Disease (COPD)
• Symptoms:
o History of prolonged smoking or exposure to biomass
o Persistent shortness of breath over months or years
o Chronic cough with sputum production
• Diagnosis:
o A history of smoking or biomass exposure with persistent respiratory symptoms
indicates COPD.
• Treatment Plan:
1. Inhaler Capsule Combiviar 200/6mcg: Use twice daily with a Rotahaler to manage
symptoms.
2. Inhaler Capsule Tioviar 18mcg: Use once daily with a Rotahaler.
3. Nebulization: Use with Ventolin or Ipnib for acute symptom management.
4. Antibiotics: Administer as necessary if an infection is present.


Current conversation:
{chat_history}

user: {input}
assistant:
`;



export async function POST(req) {
    try {
        // Extract the `messages` from the body of the request
        const { messages } = await req.json();

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

        const currentMessageContent = messages.at(-1).content;

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const model = new ChatGroq({
            model: "llama-3.1-70b-versatile",
            temperature: 0.2,
            verbose: true,
        });

        /**
       * Chat models stream message chunks rather than bytes, so this
       * output parser handles serialization and encoding.
       */
        const parser = new HttpResponseOutputParser();

       
        const chain = prompt.pipe(model).pipe(parser);


        // Convert the response into a friendly text-stream
        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            input: currentMessageContent,
        });

        // Respond with the stream
        return new StreamingTextResponse(
            stream.pipeThrough(createStreamDataTransformer()),
        );
    } catch (e) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}