import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Word } from "@/types" // Import the Word interface

export default function Words() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [newEnglishWord, setNewEnglishWord] = useState<string>("")
  const [newVietnameseWord, setNewVietnameseWord] = useState<string>("")
  const [newExample, setNewExample] = useState<string>("")
  const [editingWordId, setEditingWordId] = useState<number | null>(null)
  const [editedEnglishWord, setEditedEnglishWord] = useState<string>("")
  const [editedVietnameseWord, setEditedVietnameseWord] = useState<string>("")
  const [editedExample, setEditedExample] = useState<string>("")

  const API_BASE_URL = "http://localhost:8080/api/v1" // Adjust if your backend runs on a different port/host

  // Fetch words from the API
  const fetchWords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/words`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Word[] = await response.json()
      setWords(data)
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Add a new word
  const addWord = async () => {
    if (!newEnglishWord || !newVietnameseWord) {
      alert("English and Vietnamese words are required.")
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/words`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          english: newEnglishWord,
          vietnamese: newVietnameseWord,
          example: newExample,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const addedWord: Word = await response.json()
      setWords((prevWords) => [...prevWords, addedWord])
      setNewEnglishWord("")
      setNewVietnameseWord("")
      setNewExample("")
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  // Start editing a word
  const startEditing = (word: Word) => {
    setEditingWordId(word.id)
    setEditedEnglishWord(word.english)
    setEditedVietnameseWord(word.vietnamese)
    setEditedExample(word.example || "")
  }

  // Update an existing word
  const updateWord = async (id: number) => {
    if (!editedEnglishWord || !editedVietnameseWord) {
      alert("English and Vietnamese words are required for update.")
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/words/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          english: editedEnglishWord,
          vietnamese: editedVietnameseWord,
          example: editedExample,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const updatedWord: Word = await response.json()
      setWords((prevWords) =>
        prevWords.map((word) => (word.id === id ? updatedWord : word))
      )
      setEditingWordId(null)
      setEditedEnglishWord("")
      setEditedVietnameseWord("")
      setEditedExample("")
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  // Delete a word
  const deleteWord = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/words/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setWords((prevWords) => prevWords.filter((word) => word.id !== id))
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  // Fetch words on component mount
  useEffect(() => {
    fetchWords()
  }, [])

  if (loading) {
    return <div className="container mx-auto p-4">Loading words...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Words</CardTitle>
          <CardDescription>Manage your vocabulary.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Add New Word</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="English Word"
              value={newEnglishWord}
              onChange={(e) => setNewEnglishWord(e.target.value)}
            />
            <Input
              placeholder="Vietnamese Translation"
              value={newVietnameseWord}
              onChange={(e) => setNewVietnameseWord(e.target.value)}
            />
            <Input
              placeholder="Example Sentence (Optional)"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
            />
          </div>
          <Button onClick={addWord}>Add Word</Button>

          <h3 className="text-lg font-semibold mt-6 mb-2">Your Words</h3>
          {words.length === 0 ? (
            <p>No words found. Add some above!</p>
          ) : (
            <ul className="space-y-4">
              {words.map((word) => (
                <li key={word.id} className="border p-4 rounded-md shadow-sm">
                  {editingWordId === word.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        value={editedEnglishWord}
                        onChange={(e) => setEditedEnglishWord(e.target.value)}
                      />
                      <Input
                        value={editedVietnameseWord}
                        onChange={(e) => setEditedVietnameseWord(e.target.value)}
                      />
                      <Input
                        value={editedExample}
                        onChange={(e) => setEditedExample(e.target.value)}
                      />
                      <Button onClick={() => updateWord(word.id)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditingWordId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-bold">{word.english}</p>
                      <p className="text-gray-600">{word.vietnamese}</p>
                      {word.example && <p className="text-sm italic">"{word.example}"</p>}
                      <div className="mt-2 space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEditing(word)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteWord(word.id)}>Delete</Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          <p>Total words: {words.length}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
