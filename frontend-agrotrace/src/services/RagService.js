import { knowledgeBase } from "../data/knowledgeBase";

//calculate similarity betn words 
function calculateSimilarity(text1, text2){
    const words1 = text1.toLowerCase().split(/\W+/);
    const words2 = text2.toLowerCase().split(/\W+/);
    const overlap = words1.filter(word => words2.includes(word));
    return overlap.length / Math.sqrt(words1.length*words2.length);
}

export function findRelevantDocs(query, topK = 2){

    //Calculating similarity scores for each documents
    const scoredDocs = knowledgeBase.documents.map(doc => ({
        content: doc.content,
        score: calculateSimilarity(query, doc.content)
    }));

    //sort by similarity scores and get top k documents
    return scoredDocs
        .sort((a,b) => b.score - a.score)
        .slice(0, topK)
        .map(doc =>doc.content);
}

export function generateEnhancedPrompt(query,relevantDocs){
    return `
    Context information:
    ${relevantDocs.join('\n\n')}
    
    Based on above context please answer the following question
    ${query}
    
    If the context dosent provide enough information please say you are an imbicle`
}