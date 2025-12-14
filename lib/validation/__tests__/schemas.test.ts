import { describe, it, expect } from 'vitest'
import {
  blogPostSchema,
  projectSchema,
  commentSchema,
  subscriberSchema,
  contactFormSchema,
} from '../schemas'

describe('blogPostSchema', () => {
  const validBlogPost = {
    slug: 'my-blog-post',
    title: 'My Blog Post',
    excerpt: 'This is an excerpt for the blog post',
    content: 'This is the full content of the blog post',
    author: 'John Doe',
    read_time: '5 min read',
    tags: ['typescript', 'nextjs'],
    published: true,
  }

  it('should validate a correct blog post', () => {
    const result = blogPostSchema.safeParse(validBlogPost)
    expect(result.success).toBe(true)
  })

  it('should reject invalid slug format', () => {
    const invalid = { ...validBlogPost, slug: 'Invalid Slug!' }
    const result = blogPostSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject empty title', () => {
    const invalid = { ...validBlogPost, title: '' }
    const result = blogPostSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject short excerpt', () => {
    const invalid = { ...validBlogPost, excerpt: 'short' }
    const result = blogPostSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject short content', () => {
    const invalid = { ...validBlogPost, content: 'short' }
    const result = blogPostSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should use default values', () => {
    const minimal = {
      slug: 'test-post',
      title: 'Test Post',
      excerpt: 'This is an excerpt for testing',
      content: 'This is the full content for testing',
      author: 'Test Author',
      tags: ['test'],
    }
    const result = blogPostSchema.parse(minimal)
    expect(result.published).toBe(false)
    expect(result.read_time).toBe('5 min read')
  })

  it('should reject too many tags', () => {
    const invalid = {
      ...validBlogPost,
      tags: Array(21).fill('tag'), // Max is 20
    }
    const result = blogPostSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('projectSchema', () => {
  const validProject = {
    slug: 'my-project',
    title: 'My Project',
    description: 'A short description',
    long_description: 'A much longer description of the project',
    tech: ['TypeScript', 'React'],
    category: 'Web Development',
    image_url: 'https://example.com/image.jpg',
    live_url: 'https://example.com',
    github_url: 'https://github.com/user/repo',
    featured: true,
    display_order: 1,
  }

  it('should validate a correct project', () => {
    const result = projectSchema.safeParse(validProject)
    expect(result.success).toBe(true)
  })

  it('should reject invalid slug', () => {
    const invalid = { ...validProject, slug: 'Invalid Slug!' }
    const result = projectSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should require at least one technology', () => {
    const invalid = { ...validProject, tech: [] }
    const result = projectSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject invalid URLs', () => {
    const invalid = { ...validProject, live_url: 'not-a-url' }
    const result = projectSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should accept empty optional URLs', () => {
    const minimal = {
      slug: 'test-project',
      title: 'Test Project',
      description: 'Short description',
      long_description: 'Long description here',
      tech: ['JavaScript'],
      category: 'Testing',
      image_url: '',
      live_url: '',
      github_url: '',
    }
    const result = projectSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })

  it('should use default values', () => {
    const minimal = {
      slug: 'test-project',
      title: 'Test Project',
      description: 'Short description',
      long_description: 'Long description',
      tech: ['JavaScript'],
      category: 'Testing',
    }
    const result = projectSchema.parse(minimal)
    expect(result.featured).toBe(false)
    expect(result.display_order).toBe(0)
  })

  it('should reject negative display_order', () => {
    const invalid = { ...validProject, display_order: -1 }
    const result = projectSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('commentSchema', () => {
  const validComment = {
    post_slug: 'my-post',
    author_name: 'John Doe',
    author_email: 'john@example.com',
    content: 'This is a great post!',
  }

  it('should validate a correct comment', () => {
    const result = commentSchema.safeParse(validComment)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalid = { ...validComment, author_email: 'not-an-email' }
    const result = commentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject empty author name', () => {
    const invalid = { ...validComment, author_name: '' }
    const result = commentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject short content', () => {
    const invalid = { ...validComment, content: 'Hi' }
    const result = commentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject too long content', () => {
    const invalid = { ...validComment, content: 'a'.repeat(10001) }
    const result = commentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('subscriberSchema', () => {
  it('should validate a correct email', () => {
    const result = subscriberSchema.safeParse({ email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'test@',
      'test.example.com',
      'test @example.com',
    ]

    invalidEmails.forEach((email) => {
      const result = subscriberSchema.safeParse({ email })
      expect(result.success).toBe(false)
    })
  })

  it('should reject empty email', () => {
    const result = subscriberSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})

describe('contactFormSchema', () => {
  const validForm = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about services',
    message: 'I would like to know more about your services.',
    recaptchaToken: 'valid-token-string',
  }

  it('should validate a correct contact form', () => {
    const result = contactFormSchema.safeParse(validForm)
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const invalid = { ...validForm, name: '' }
    const result = contactFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const invalid = { ...validForm, email: 'not-an-email' }
    const result = contactFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject short subject', () => {
    const invalid = { ...validForm, subject: 'Hi' }
    const result = contactFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject short message', () => {
    const invalid = { ...validForm, message: 'Hello' }
    const result = contactFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject missing recaptcha token', () => {
    const invalid = { ...validForm, recaptchaToken: '' }
    const result = contactFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject too long inputs', () => {
    const tooLong = {
      ...validForm,
      name: 'a'.repeat(101),
      subject: 'a'.repeat(201),
      message: 'a'.repeat(10001),
    }

    expect(contactFormSchema.safeParse({ ...validForm, name: tooLong.name }).success).toBe(false)
    expect(contactFormSchema.safeParse({ ...validForm, subject: tooLong.subject }).success).toBe(false)
    expect(contactFormSchema.safeParse({ ...validForm, message: tooLong.message }).success).toBe(false)
  })
})
