'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle, Heart, Plus, Trash2, Shield, ShieldOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackButton } from '@/components/BackButton'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Post {
  id: string
  author: string
  title: string
  content: string
  category: string
  createdAt: string
  likes: number
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

export default function Comunidade() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'geral'
  })
  const [newComment, setNewComment] = useState('')
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'post' | 'comment'
    postId?: string
    commentId?: string
  }>({ open: false, type: 'post' })

  // Load posts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('communityPosts')
    if (saved) {
      setPosts(JSON.parse(saved))
    } else {
      // Initialize with sample posts
      const samplePosts: Post[] = [
        {
          id: '1',
          author: 'Maria Silva',
          title: 'Meu bebê de 3 meses não dorme a noite toda',
          content: 'Olá mamães! Meu filho tem 3 meses e acorda várias vezes durante a noite. Alguém tem dicas para ajudar ele a dormir melhor?',
          category: 'sono',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 5,
          comments: [
            {
              id: '1',
              author: 'Ana Santos',
              content: 'Tente estabelecer uma rotina consistente antes de dormir. Meu filho melhorou muito com isso!',
              createdAt: new Date(Date.now() - 43200000).toISOString()
            }
          ]
        },
        {
          id: '2',
          author: 'João Pereira',
          title: 'Rotina de sonecas durante o dia',
          content: 'Como vocês organizam as sonecas do bebê durante o dia? Meu filho de 6 meses tem dificuldade para manter uma rotina.',
          category: 'rotina',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          likes: 3,
          comments: []
        },
        {
          id: '3',
          author: 'Carla Oliveira',
          title: 'Dicas para o primeiro mês',
          content: 'Compartilhando algumas dicas que funcionaram comigo no primeiro mês: mantenha o quarto escuro, use ruído branco, e tenha paciência!',
          category: 'dicas',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          likes: 8,
          comments: [
            {
              id: '2',
              author: 'Paula Costa',
              content: 'Obrigada pelas dicas! Já estou aplicando algumas.',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        }
      ]
      setPosts(samplePosts)
      localStorage.setItem('communityPosts', JSON.stringify(samplePosts))
    }
  }, [])

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    localStorage.setItem('communityPosts', JSON.stringify(posts))
  }, [posts])

  const addPost = () => {
    if (!newPost.title || !newPost.content) return

    const post: Post = {
      id: Date.now().toString(),
      author: 'Você', // In a real app, this would be the logged-in user
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    }

    setPosts([post, ...posts])
    setNewPost({ title: '', content: '', category: 'geral' })
  }

  const addComment = (postId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Você',
      content: newComment,
      createdAt: new Date().toISOString()
    }

    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ))
    setNewComment('')
    setSelectedPost(null)
  }

  const likePost = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sono': return 'bg-blue-100 text-blue-800'
      case 'rotina': return 'bg-green-100 text-green-800'
      case 'dicas': return 'bg-purple-100 text-purple-800'
      case 'alimentacao': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin)
  }

  const openDeleteDialog = (type: 'post' | 'comment', postId: string, commentId?: string) => {
    setDeleteDialog({
      open: true,
      type,
      postId,
      commentId
    })
  }

  const confirmDelete = () => {
    if (deleteDialog.type === 'post' && deleteDialog.postId) {
      deletePost(deleteDialog.postId)
    } else if (deleteDialog.type === 'comment' && deleteDialog.postId && deleteDialog.commentId) {
      deleteComment(deleteDialog.postId, deleteDialog.commentId)
    }
    setDeleteDialog({ open: false, type: 'post' })
  }

  const deletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  const deleteComment = (postId: string, commentId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
        : post
    ))
  }

  const canDelete = (author: string) => {
    return isAdmin || author === 'Você'
  }

  return (
    <ProtectedRoute requiredPlan="pro" featureName="Comunidade Premium">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-teal-900 mb-2 flex items-center justify-center gap-2">
            <Users className="w-8 h-8" />
            Comunidade de Pais
          </h1>
          <p className="text-gray-600">Compartilhe experiências e tire dúvidas com outros pais</p>
        </div>

        {/* Admin Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={toggleAdmin}
            variant={isAdmin ? "default" : "outline"}
            className={`flex items-center gap-2 ${isAdmin ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {isAdmin ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
            {isAdmin ? 'Modo Admin Ativo' : 'Ativar Modo Admin'}
          </Button>
        </div>

        {/* Add New Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Compartilhar Experiência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título da sua pergunta/comentário"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            />
            <Textarea
              placeholder="Compartilhe sua experiência, faça uma pergunta ou dê uma dica..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              rows={4}
            />
            <div className="flex gap-4">
              <select
                className="flex-1 p-2 border border-gray-300 rounded-md"
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              >
                <option value="geral">Geral</option>
                <option value="sono">Sono</option>
                <option value="rotina">Rotina</option>
                <option value="dicas">Dicas</option>
                <option value="alimentacao">Alimentação</option>
              </select>
              <Button onClick={addPost} className="px-8">
                Publicar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{post.author}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(post.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    {canDelete(post.author) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog('post', post.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{post.content}</p>

                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => likePost(post.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {post.comments.length}
                  </Button>
                </div>

                {/* Comments */}
                {selectedPost === post.id && (
                  <div className="border-t pt-4">
                    <div className="space-y-4 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{getInitials(comment.author)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(comment.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                              </span>
                              {canDelete(comment.author) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog('comment', post.id, comment.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Escreva um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                      />
                      <Button onClick={() => addComment(post.id)} size="sm">
                        Comentar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Seja o primeiro a compartilhar uma experiência!</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'post'
                ? 'Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita e todos os comentários serão removidos.'
                : 'Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ProtectedRoute>
  )
}