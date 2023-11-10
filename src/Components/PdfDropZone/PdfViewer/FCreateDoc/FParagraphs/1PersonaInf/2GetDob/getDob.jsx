import { Paragraph, TextRun } from 'docx';
import nlp from 'compromise';
import dates from 'compromise-dates';

nlp.extend(dates);



const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
const extractDob = async (text) => {
    const sectionKeywords = ["informazioni personali", "dati personali", "personal information", "personal details"];
    let dob = null;
    const normalizedText = removeAccents(text.toLowerCase());
    const findPersonalSection = sectionKeywords.some((keyword) =>
        normalizedText.includes(removeAccents(keyword.toLowerCase()))
    );
    if (findPersonalSection) {
        const doc = nlp(normalizedText);// Prima ricerca con compromise per le date.
        const dates = doc.dates().format('iso').out('array');
        if (dates.length > 0) {
            dob = dates[0];// Supponendo che la prima data trovata sia la DOB, dato che siamo nella sezione personale
        } else {
            const keywords = ["data di nascita", "nato il", "nata il", "nascita", "compleanno", "età", "eta'", "age"];//proced con metodo hardcoded
            const lines = normalizedText.split('\n');
            for (const keyword of keywords) {
                const normalizedKeyword = removeAccents(keyword.toLowerCase());
                const line = lines.find((line) => line.includes(normalizedKeyword));
                if (line) {
                    const dateMatch = line.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
                    if (dateMatch) {
                        dob = dateMatch[1];
                        break;
                    } else {
                        const ageMatch = line.match(/\b(?:età|eta'|age)\s*[:\s]\s*(\d{1,2})\b/);
                        if (ageMatch && parseInt(ageMatch[1], 10) >= 16 && parseInt(ageMatch[1], 10) <= 60) {
                            dob = keyword === "age" ? `(Age: ${ageMatch[1]})` : `(Età: ${ageMatch[1]})`;
                            break;
                        }
                    }
                }
            }
        }
    }
    return dob;
};



// ------------------------------------------------------------OUTPUT
export const getDob = async (text) => {
    const dob = await extractDob(text);
    console.log(`DOB: ${dob ? dob : " nd "}`);
    if (!dob) {
        return null;
    }
    return new Paragraph({
        alignment: "left",
        children: [
            new TextRun({
<<<<<<< HEAD
                text: `Data di Nascita: ${dob}`,
=======
                text: "Data di Nascita: ",
                bold: true,
            }),
            new TextRun({
                text: dob,
                bold: false,
>>>>>>> 7be3d169 (Il tuo messaggio di commit)
            })
        ],
    });
};
