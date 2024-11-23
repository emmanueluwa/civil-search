# Eurocode 2 RAG Knowledge Base

A powerful Retrieval Augmented Generation (RAG) application designed specifically for civil and structural engineers to quickly search, analyze, and retrieve information from Eurocode 2 documentation. Built using Pinecone, Next.js, and LangChain.

## 🚀 Features

- **Intelligent Document Search**: Quickly find relevant sections from Eurocode 2 using natural language queries
- **Context-Aware Responses**: Get accurate answers with direct references to specific sections of the standard

## 🛠️ Tech Stack

- **Frontend**: Next.js with Tailwind CSS and Shadcn UI
- **Vector Database**: Pinecone
- **Document Processing**: LangChain
- **Embedding Generation**: Transformers.js (Hugging Face models)
- **UI Framework**: Tailwind CSS & Shadcn UI

## 🔧 Installation

1. Clone the repository:

```bash
git clone [https://github.com/emmanueluwa/civil-search]
cd [civil-search]
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Add your Pinecone API key and other required variables to `.env.local`

4. Run the development server:

```bash
npm run dev
```

## 💡 Use Cases

- **Quick Reference**: Instantly find specific clauses and requirements from Eurocode 2
- **Design Validation**: Cross-reference design decisions with standard requirements
- **Knowledge Management**: Create a searchable knowledge base of structural design standards

## 🔄 How It Works

1. **Document Upload**: Upload PDF versions of Eurocode 2 and related documentation
2. **Processing Pipeline**:
   - Document chunking using LangChain text splitters
   - Embedding generation with Transformers.js
   - Vector storage in Pinecone database
3. **Retrieval**: Use natural language queries to find relevant sections
4. **Response Generation**: Get contextually relevant answers with direct references

## 🎯 Target Users

- Civil Engineers
- Structural Engineers
- Engineering Students

## 🙏 Acknowledgments

- Utilizes the Mixedbread AI embedding model
- Built with Next.js and Pinecone
