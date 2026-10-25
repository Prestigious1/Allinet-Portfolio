import { buildConfig, CollectionConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ── Shared Standard Fields & Config ──────────────────────────────────────────

const standardAccess = {
  read: () => true,
  create: ({ req: { user } }: any) => Boolean(user),
  update: ({ req: { user } }: any) => Boolean(user),
  delete: ({ req: { user } }: any) => Boolean(user),
}

const seoFields = [
  {
    name: 'seo',
    type: 'group',
    fields: [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'textarea' },
      { name: 'keywords', type: 'text' },
    ],
  },
] as any

const applyStandardConfig = (collection: CollectionConfig): CollectionConfig => {
  return {
    ...collection,
    access: collection.access || standardAccess,
    versions: collection.versions || { drafts: true },
    fields: [
      ...collection.fields,
      ...seoFields,
      // Note: slug is explicitly added per-collection where needed, 
      // Payload auto-adds createdAt, updatedAt, and _status (due to drafts: true)
    ],
  }
}

// ── Collections ────────────────────────────────────────────────────────────

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ALLINET OS Admin',
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-local-dev-only-change-in-prod',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    applyStandardConfig({
      slug: 'projects',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true, admin: { description: 'The name of your project (e.g., "ALLINET OS").' } },
        { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'The URL-friendly version of the title (e.g., "allinet-os"). This is used in the browser address bar. Must be lowercase with no spaces.' } },
        { name: 'tagline', type: 'text', required: true, admin: { description: 'A short, catchy summary of the project. Usually 1-2 sentences (e.g., "An award-winning interactive developer portfolio").' } },
        { name: 'description', type: 'richText', required: true, admin: { description: 'The full, detailed explanation of the project, what you built, and why.' } },
        { name: 'cover_image', type: 'upload', relationTo: 'media', required: true, admin: { description: 'The main thumbnail image shown on the project card.' } },
        { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'Additional screenshots or images of the project.' } },
        { name: 'demo_url', type: 'text', admin: { description: 'Link to the live project (e.g., https://my-project.com).' } },
        { name: 'repo_url', type: 'text', admin: { description: 'Link to the source code (e.g., GitHub or GitLab repository).' } },
        { name: 'video_url', type: 'text', admin: { description: 'Link to a YouTube or Vimeo demo video.' } },
        { name: 'featured', type: 'checkbox', required: true, defaultValue: false, admin: { description: 'Check this to highlight this project on your main home screen or top of the list.' } },
        { name: 'featured_order', type: 'number', admin: { description: 'If featured, what order should it appear in? (1 = first).' } },
        { name: 'category', type: 'relationship', relationTo: 'project-categories', hasMany: true, required: true, admin: { description: 'Select one or more categories (e.g., Web App, AI).' } },
        { name: 'tech_stack', type: 'relationship', relationTo: 'technologies', hasMany: true, required: true, admin: { description: 'Select the technologies used (e.g., React, Node.js).' } },
        { name: 'start_date', type: 'date', admin: { description: 'When did you start this project?' } },
        { name: 'end_date', type: 'date', admin: { description: 'Leave blank if the project is still ongoing.' } },
        { name: 'metrics', type: 'json', admin: { description: 'Write raw JSON for performance metrics. Example: { "users": "10k+", "uptime": "99.9%" }' } },
        { name: 'challenges', type: 'richText', admin: { description: 'What were the hardest parts of building this?' } },
        { name: 'learnings', type: 'richText', admin: { description: 'What did you learn from this project?' } },
        { name: 'sort_order', type: 'number', admin: { description: 'Used to sort projects in the UI. Lower numbers appear first.' } },
      ],
    }),
    applyStandardConfig({
      slug: 'project-categories',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Name of the category (e.g., "Web App").' } },
        { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'URL-friendly name (e.g., "web-app").' } },
        { name: 'icon', type: 'text', admin: { description: 'Emoji or short icon code (e.g., 🌐 or 📱).' } },
        { name: 'color', type: 'text', admin: { description: 'Hex color code (e.g., #FFFFFF).' } },
        { name: 'description', type: 'text', admin: { description: 'Short description of what this category entails.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'technologies',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Name of the technology (e.g., "React").' } },
        { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'URL-friendly identifier (e.g., "react").' } },
        { name: 'icon_url', type: 'upload', relationTo: 'media', admin: { description: 'Upload the logo of the technology (SVG or transparent PNG preferred).' } },
        { name: 'category', type: 'select', options: ['frontend', 'backend', 'ai', 'db', 'cloud', 'devops', 'security', 'mobile'], required: true, admin: { description: 'Which category best fits this technology?' } },
        { name: 'proficiency', type: 'number', required: true, min: 1, max: 5, admin: { description: 'Your skill level from 1 to 5 (5 is expert).' } },
        { name: 'years', type: 'number', admin: { description: 'How many years of experience you have with it.' } },
        { name: 'description', type: 'text', admin: { description: 'Brief note on how you use it.' } },
        { name: 'official_url', type: 'text', admin: { description: 'Link to the technology\'s official website.' } },
        { name: 'color', type: 'text', admin: { description: 'Brand color hex code (e.g., #61DAFB for React).' } },
      ]
    }),
    applyStandardConfig({
      slug: 'experiences',
      admin: { useAsTitle: 'company' },
      fields: [
        { name: 'company', type: 'text', required: true, admin: { description: 'Name of the company or organization.' } },
        { name: 'company_logo', type: 'upload', relationTo: 'media', admin: { description: 'Company logo (transparent background preferred).' } },
        { name: 'company_url', type: 'text', admin: { description: 'Link to the company website.' } },
        { name: 'role', type: 'text', required: true, admin: { description: 'Your job title.' } },
        { name: 'type', type: 'select', options: ['full-time', 'part-time', 'contract', 'freelance', 'internship'], required: true, admin: { description: 'Type of employment.' } },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', admin: { description: 'Leave blank if you still work here.' } },
        { name: 'is_current', type: 'checkbox', defaultValue: false, admin: { description: 'Check this if this is your current job.' } },
        { name: 'location', type: 'text', admin: { description: 'City, Country (e.g., "Lagos, Nigeria").' } },
        { name: 'remote', type: 'checkbox', defaultValue: false, admin: { description: 'Check this if the role was remote.' } },
        { name: 'description', type: 'richText', required: true, admin: { description: 'Detailed description of your responsibilities.' } },
        { name: 'achievements', type: 'json', admin: { description: 'Raw JSON array of key achievements. Example: ["Increased revenue by 10%", "Built an AI system"]' } },
        { name: 'tech_stack', type: 'relationship', relationTo: 'technologies', hasMany: true, admin: { description: 'Select the tools and languages you used here.' } },
        { name: 'sort_order', type: 'number', admin: { description: 'Used to sort experiences. Lower numbers appear first.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'education',
      admin: { useAsTitle: 'institution' },
      fields: [
        { name: 'institution', type: 'text', required: true, admin: { description: 'Name of the university or school.' } },
        { name: 'institution_logo', type: 'upload', relationTo: 'media', admin: { description: 'School logo.' } },
        { name: 'degree', type: 'text', required: true, admin: { description: 'E.g., "Bachelor of Science", "Master of Arts".' } },
        { name: 'field', type: 'text', required: true, admin: { description: 'Your major or field of study (e.g., "Computer Science").' } },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', admin: { description: 'Graduation date. Leave blank if currently enrolled.' } },
        { name: 'grade', type: 'text', admin: { description: 'E.g., "First Class Honors" or "3.8 GPA".' } },
        { name: 'description', type: 'richText', admin: { description: 'Details about coursework or clubs.' } },
        { name: 'achievements', type: 'json', admin: { description: 'JSON array of awards. Example: ["Dean\'s List 2021", "Best Project Award"]' } },
      ]
    }),
    applyStandardConfig({
      slug: 'certificates',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Name of the certificate (e.g., "AWS Certified Developer").' } },
        { name: 'issuer', type: 'text', required: true, admin: { description: 'Who issued it? (e.g., "Amazon Web Services").' } },
        { name: 'issuer_logo', type: 'upload', relationTo: 'media', admin: { description: 'Logo of the issuing organization.' } },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date', admin: { description: 'Leave blank if it never expires.' } },
        { name: 'credential_id', type: 'text', admin: { description: 'The unique ID on the certificate.' } },
        { name: 'credential_url', type: 'text', admin: { description: 'Link to verify the certificate online.' } },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'A scan or image of the certificate.' } },
        { name: 'category', type: 'select', options: ['cloud', 'security', 'ai', 'web', 'data', 'other'], required: true, admin: { description: 'Which domain does this certificate belong to?' } },
        { name: 'featured', type: 'checkbox', defaultValue: false, admin: { description: 'Highlight this certificate on your profile.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'blog-posts',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true, admin: { description: 'Title of the blog post.' } },
        { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'URL-friendly title (e.g., "my-first-post").' } },
        { name: 'excerpt', type: 'textarea', required: true, admin: { description: 'A short summary shown on the blog feed.' } },
        { name: 'content', type: 'richText', required: true, admin: { description: 'The main body of your blog post.' } },
        { name: 'cover_image', type: 'upload', relationTo: 'media', required: true, admin: { description: 'The header image for the post.' } },
        { name: 'tags', type: 'json', admin: { description: 'JSON array of tags. Example: ["React", "Tutorial"]' } },
        { name: 'category', type: 'select', options: ['tutorial', 'thoughts', 'project', 'news'], required: true, admin: { description: 'Select the type of post — Tutorial, Personal Thoughts, Project Showcase, or News.' } },
        { name: 'featured', type: 'checkbox', defaultValue: false, admin: { description: 'Pin this post to the top of the blog.' } },
        { name: 'ai_summary', type: 'textarea', admin: { description: 'Optional summary generated by AI.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'testimonials',
      admin: { useAsTitle: 'author_name' },
      fields: [
        { name: 'author_name', type: 'text', required: true, admin: { description: 'Name of the person recommending you.' } },
        { name: 'author_role', type: 'text', required: true, admin: { description: 'Their job title (e.g., "CTO").' } },
        { name: 'author_company', type: 'text', required: true, admin: { description: 'The company they work for.' } },
        { name: 'author_avatar', type: 'upload', relationTo: 'media', admin: { description: 'A photo of the person.' } },
        { name: 'author_linkedin', type: 'text', admin: { description: 'Link to their LinkedIn profile.' } },
        { name: 'content', type: 'textarea', required: true, admin: { description: 'What they said about you.' } },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5, defaultValue: 5, admin: { description: 'Star rating from 1 to 5.' } },
        { name: 'featured', type: 'checkbox', defaultValue: false, admin: { description: 'Show this testimonial on the home screen.' } },
        { name: 'sort_order', type: 'number', admin: { description: 'Used to sort testimonials. Lower numbers appear first.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'achievements',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'achievement_id', type: 'text', required: true, unique: true, admin: { description: 'Internal ID used in code (e.g., "clicked-logo-10-times").' } },
        { name: 'title', type: 'text', required: true, admin: { description: 'Name shown to the user when unlocked.' } },
        { name: 'description', type: 'text', required: true, admin: { description: 'Explanation of what they did to unlock it.' } },
        { name: 'icon', type: 'text', required: true, admin: { description: 'Emoji icon for the achievement (e.g., 🏆).' } },
        { name: 'trigger', type: 'select', options: ['manual', 'easter-egg', 'navigation', 'terminal', 'time'], required: true, admin: { description: 'What type of action triggers this?' } },
        { name: 'trigger_value', type: 'text', admin: { description: 'The specific command or action required.' } },
        { name: 'rarity', type: 'select', options: ['common', 'uncommon', 'rare', 'legendary'], required: true, admin: { description: 'How hard is this to unlock?' } },
        { name: 'secret', type: 'checkbox', defaultValue: true, admin: { description: 'Hide this achievement from the user until they unlock it.' } },
        { name: 'points', type: 'number', required: true, admin: { description: 'Gamification points awarded.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'worlds',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Name of the 3D world (e.g., "Cyber City").' } },
        { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'URL-friendly name (e.g., "cyber-city").' } },
        { name: 'description', type: 'text', admin: { description: 'Short description of the world.' } },
        { name: 'thumbnail', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Preview image of the world.' } },
        { name: 'scene_type', type: 'select', options: ['city', 'office', 'space', 'lab', 'server', 'custom'], required: true, admin: { description: 'Determines which predefined 3D scene loads.' } },
        { name: 'model_url', type: 'text', admin: { description: 'URL to a custom .gltf or .glb file if using "custom" type.' } },
        { name: 'environment_preset', type: 'text', admin: { description: 'Three.js environment map (e.g., "city", "sunset").' } },
        { name: 'ambient_color', type: 'text', required: true, admin: { description: 'Hex color for the global lighting (e.g., #FFFFFF).' } },
        { name: 'fog_color', type: 'text', admin: { description: 'Hex color for the distance fog.' } },
        { name: 'fog_density', type: 'number', admin: { description: 'How thick the fog is (e.g., 0.002).' } },
        { name: 'music_url', type: 'text', admin: { description: 'Background music file URL.' } },
        { name: 'ambient_sound_url', type: 'text', admin: { description: 'Background ambient noise (e.g., rain, wind).' } },
        { name: 'weather', type: 'select', options: ['clear', 'rain', 'fog', 'storm'], admin: { description: 'Weather particle effects.' } },
        { name: 'time_of_day', type: 'select', options: ['dawn', 'day', 'dusk', 'night'], admin: { description: 'Affects sky and sun positioning.' } },
        { name: 'post_processing', type: 'json', admin: { description: 'JSON config for bloom and effects. Example: { "bloomStrength": 1.5 }' } },
        { name: 'particles', type: 'json', admin: { description: 'JSON config for custom particles.' } },
        { name: 'is_active', type: 'checkbox', defaultValue: false, admin: { description: 'Allow users to select this world.' } },
        { name: 'is_default', type: 'checkbox', defaultValue: false, admin: { description: 'Load this world automatically on first visit.' } },
        { name: 'sort_order', type: 'number' },
      ]
    }),
    applyStandardConfig({
      slug: 'desktop-apps',
      admin: { useAsTitle: 'label' },
      fields: [
        { name: 'app_id', type: 'text', required: true, unique: true, admin: { description: 'Internal ID matching the frontend React component (e.g., "terminal", "resume").' } },
        { name: 'label', type: 'text', required: true, admin: { description: 'Display name under the icon.' } },
        { name: 'icon_name', type: 'text', required: true, admin: { description: 'Lucide icon name (e.g., "Terminal") or emoji. Fallback if no media is provided.' } },
        { name: 'icon_media', type: 'upload', relationTo: 'media', admin: { description: 'Upload a custom icon image (SVG/PNG). Overrides icon_name if set.' } },
        { name: 'icon_color', type: 'text', admin: { description: 'Hex color for the icon background effects.' } },
        { name: 'show_on_desktop', type: 'checkbox', defaultValue: true, admin: { description: 'Show a shortcut on the desktop grid.' } },
        { name: 'show_in_dock', type: 'checkbox', defaultValue: true, admin: { description: 'Show a shortcut in the bottom dock.' } },
        { name: 'show_in_menu', type: 'checkbox', defaultValue: true, admin: { description: 'Show in the start menu/launcher.' } },
        { name: 'show_in_search', type: 'checkbox', defaultValue: true, admin: { description: 'Show in the command palette search.' } },
        { name: 'desktop_position', type: 'json', admin: { description: 'JSON for grid coordinates. Example: { "x": 10, "y": 20 }' } },
        { name: 'dock_position', type: 'number', admin: { description: 'Order from left to right in the dock.' } },
        { name: 'enabled', type: 'checkbox', defaultValue: true, admin: { description: 'Can the user open this app?' } },
        { name: 'requires_auth', type: 'checkbox', defaultValue: false, admin: { description: 'Only logged-in admins can open it.' } },
        { name: 'default_size', type: 'json', admin: { description: 'JSON for starting width/height. Example: { "width": 800, "height": 600 }' } },
        { name: 'min_size', type: 'json', admin: { description: 'JSON for minimum window size.' } },
      ]
    }),
    applyStandardConfig({
      slug: 'media',
      access: {
        read: () => true,
      },
      upload: {
        staticDir: 'media',
        imageSizes: [
          { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
          { name: 'card', width: 768, height: 1024, position: 'centre' },
          { name: 'tablet', width: 1024, height: undefined, position: 'centre' },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*', 'application/pdf'],
      },
      fields: [
        { name: 'alt', type: 'text', admin: { description: 'Alternative text for accessibility and SEO (e.g., "Screenshot of the ALLINET OS desktop"). Describe what the image shows.' } },
      ],
    }),
    {
      slug: 'contact-submissions',
      admin: { useAsTitle: 'subject' },
      access: {
        read: ({ req: { user } }: any) => Boolean(user), // Only admins can read contact submissions
        create: () => true, // Anyone can submit (api endpoint)
        update: ({ req: { user } }: any) => Boolean(user),
        delete: ({ req: { user } }: any) => Boolean(user),
      },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Full name of the person who submitted the contact form.' } },
        { name: 'email', type: 'email', required: true, admin: { description: 'Email address provided by the sender — used to reply to them.' } },
        { name: 'subject', type: 'text', required: true, admin: { description: 'Subject line of the message.' } },
        { name: 'message', type: 'textarea', required: true, admin: { description: 'The full message body submitted via the contact form.' } },
        { name: 'status', type: 'select', options: ['unread', 'read', 'replied', 'spam'], defaultValue: 'unread', admin: { description: 'Track the status of this submission. Update to "replied" once you have responded.' } },
        { name: 'ip_hash', type: 'text', admin: { description: 'Anonymised hash of the sender\'s IP address — used for spam detection only. Do not edit.' } },
      ]
    },
    applyStandardConfig({
      slug: 'ai-memories',
      admin: { useAsTitle: 'title' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'textarea', required: true },
        { name: 'category', type: 'select', options: ['general', 'bio', 'project', 'experience', 'trading', 'other'], required: true, defaultValue: 'general' },
        { name: 'importance', type: 'select', options: ['high', 'medium', 'low'], required: true, defaultValue: 'medium' },
      ]
    }),
    {
      slug: 'ai-conversations',
      admin: { useAsTitle: 'session_id' },
      access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
      },
      fields: [
        { name: 'session_id', type: 'text', required: true, unique: true },
        { name: 'title', type: 'text' },
        { name: 'messages', type: 'json', required: true },
      ]
    },
    {
      slug: 'leads',
      admin: { useAsTitle: 'name' },
      access: {
        read: ({ req: { user } }: any) => Boolean(user),
        create: ({ req: { user } }: any) => Boolean(user),
        update: ({ req: { user } }: any) => Boolean(user),
        delete: ({ req: { user } }: any) => Boolean(user),
      },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Full name of the lead.' } },
        { name: 'email', type: 'email', required: true, admin: { description: 'Primary contact email.' } },
        { name: 'whatsapp', type: 'text', admin: { description: 'WhatsApp number for rapid follow-up.' } },
        { name: 'company', type: 'text', admin: { description: 'Company or business name.' } },
        { name: 'role', type: 'text', admin: { description: 'Lead role or target audience (e.g. founder, recruiter).' } },
        { name: 'need', type: 'textarea', admin: { description: 'Specific project need or inquiry.' } },
        { name: 'budgetRange', type: 'text', admin: { description: 'Estimated budget tier.' } },
        { name: 'timeline', type: 'text', admin: { description: 'Target delivery timeline.' } },
        { name: 'sourcePage', type: 'text', admin: { description: 'Page where the lead converted.' } },
        { name: 'sourceChannel', type: 'text', admin: { description: 'Acquisition channel or referrer.' } },
        {
          name: 'status',
          type: 'select',
          options: ['new', 'contacted', 'qualified', 'won', 'lost'],
          defaultValue: 'new',
          required: true,
          admin: { description: 'Pipeline stage of the lead.' },
        },
        { name: 'notes', type: 'textarea', admin: { description: 'Internal team notes.' } },
        { name: 'consentGivenAt', type: 'date', admin: { description: 'Timestamp when contact consent was given.' } },
        { name: 'ipHash', type: 'text', admin: { description: 'Anonymized hash of client IP.' } },
      ],
    },
    {
      slug: 'briefs',
      admin: { useAsTitle: 'businessName' },
      access: {
        read: ({ req: { user } }: any) => Boolean(user),
        create: ({ req: { user } }: any) => Boolean(user),
        update: ({ req: { user } }: any) => Boolean(user),
        delete: ({ req: { user } }: any) => Boolean(user),
      },
      fields: [
        { name: 'lead', type: 'relationship', relationTo: 'leads', admin: { description: 'Linked lead submission if available.' } },
        { name: 'organizationType', type: 'text', admin: { description: 'Type of organization (e.g. Startup, Enterprise, SME).' } },
        { name: 'businessName', type: 'text', required: true, admin: { description: 'Name of the business or project.' } },
        { name: 'problem', type: 'textarea', required: true, admin: { description: 'Core problem statement or project requirements.' } },
        { name: 'currentTools', type: 'text', admin: { description: 'Tools and tech currently used.' } },
        { name: 'modules', type: 'json', admin: { description: 'Selected project scope modules.' } },
        { name: 'locationsCount', type: 'number', admin: { description: 'Number of locations or branches involved.' } },
        { name: 'timeline', type: 'text', admin: { description: 'Desired launch timeline.' } },
        { name: 'budgetRange', type: 'text', admin: { description: 'Target budget range.' } },
        { name: 'generatedProposal', type: 'json', admin: { description: 'Auto-generated proposal data structure.' } },
        { name: 'shareTokenHash', type: 'text', admin: { description: 'Unique hash for unguessable client share link.' } },
      ],
    },
    {
      slug: 'knowledge-items',
      admin: { useAsTitle: 'title' },
      access: {
        read: ({ req: { user } }: any) => Boolean(user), // Admin only via REST; server reads via Local API bypass
        create: ({ req: { user } }: any) => Boolean(user),
        update: ({ req: { user } }: any) => Boolean(user),
        delete: ({ req: { user } }: any) => Boolean(user),
      },
      fields: [
        { name: 'title', type: 'text', required: true, admin: { description: 'Headline or summary of this verified fact.' } },
        {
          name: 'category',
          type: 'select',
          options: ['architecture', 'dx', 'patterns', 'troubleshooting', 'faq', 'general', 'experience'],
          required: true,
          index: true,
          admin: { description: 'Knowledge taxonomy category.' },
        },
        { name: 'content', type: 'textarea', required: true, admin: { description: 'Plain text knowledge fact for deterministic retrieval.' } },
        { name: 'sourcePath', type: 'text', admin: { description: 'Source code path, mission file, or document citation.' } },
        { name: 'tags', type: 'json', admin: { description: 'Array of search keywords/tags.' } },
        { name: 'isPublic', type: 'checkbox', defaultValue: true, index: true, admin: { description: 'Whether this item is eligible for public concierge retrieval.' } },
        { name: 'verifiedAt', type: 'date', admin: { description: 'Date when this knowledge was verified.' } },
      ],
    }
  ],

  // ── Globals ────────────────────────────────────────────────────────────────
  globals: [
    {
      slug: 'portfolio-owner',
      access: {
        read: () => true,
      },
      fields: [
        { name: 'full_name', type: 'text', required: true, admin: { description: 'Your legal full name (e.g., "Ajibade Alli Akinkunmi"). Used in formal contexts like the resume and meta tags.' } },
        { name: 'display_name', type: 'text', required: true, admin: { description: 'The name displayed prominently on your portfolio (e.g., "ALLINET" or "Alli").' } },
        { name: 'title', type: 'text', required: true, admin: { description: 'Your professional headline (e.g., "Full-Stack Developer & AI Engineer"). Appears below your name.' } },
        { name: 'bio_short', type: 'textarea', required: true, admin: { description: 'A 1-3 sentence elevator pitch about yourself. Used on hover cards and preview sections.' } },
        { name: 'bio_long', type: 'richText', required: true, admin: { description: 'Your full About Me story — can include multiple paragraphs, formatting, and links.' } },
        { name: 'avatar', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Your professional profile photo (square crop, minimum 400×400px recommended).' } },
        { name: 'avatar_3d', type: 'upload', relationTo: 'media', admin: { description: 'Optional 3D avatar or stylised version of yourself for the interactive OS environment.' } },
        { name: 'email', type: 'email', required: true, admin: { description: 'Your contact email address — displayed publicly in the contact section.' } },
        { name: 'phone', type: 'text', admin: { description: 'Your phone number (optional). Leave blank to hide from public view.' } },
        { name: 'location', type: 'text', required: true, admin: { description: 'City and country (e.g., "Lagos, Nigeria"). Shown on your profile and resume.' } },
        { name: 'location_lat', type: 'number', admin: { description: 'Latitude coordinate of your location (e.g., 6.5244 for Lagos). Used to pin your location on a map widget.' } },
        { name: 'location_lng', type: 'number', admin: { description: 'Longitude coordinate of your location (e.g., 3.3792 for Lagos). Used together with location_lat.' } },
        { name: 'resume_pdf', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Upload your latest CV/Resume as a PDF. This is what visitors download when they click "Download Resume".' } },
        { name: 'github_url', type: 'text', required: true, admin: { description: 'Full URL to your GitHub profile (e.g., https://github.com/your-username).' } },
        { name: 'linkedin_url', type: 'text', required: true, admin: { description: 'Full URL to your LinkedIn profile (e.g., https://linkedin.com/in/your-profile).' } },
        { name: 'twitter_url', type: 'text', admin: { description: 'Full URL to your X/Twitter profile. Leave blank to hide the Twitter icon.' } },
        { name: 'website_url', type: 'text', admin: { description: 'Link to any other personal website or portfolio. Leave blank if not applicable.' } },
        { name: 'open_to_work', type: 'checkbox', defaultValue: true, admin: { description: 'Check this if you are currently available for new opportunities. Shows an "Open to Work" badge.' } },
        { name: 'availability', type: 'text', admin: { description: 'Describe your current availability (e.g., "Available from August 2026" or "Freelance — 20 hrs/week").' } },
      ],
    },
    {
      slug: 'site-settings',
      access: {
        read: () => true,
      },
      fields: [
        { name: 'site_name', type: 'text', defaultValue: 'ALLINET OS', admin: { description: 'The name of your site shown in the browser tab and header (e.g., "ALLINET OS").' } },
        { name: 'meta_title', type: 'text', admin: { description: 'The SEO title shown in Google results (e.g., "Ajibade Alli — Full-Stack Developer"). Keep under 60 characters.' } },
        { name: 'meta_description', type: 'textarea', admin: { description: 'The SEO description shown below your site name in Google. Summarise your portfolio in 1-2 sentences. Keep under 160 characters.' } },
        { name: 'og_image', type: 'upload', relationTo: 'media', admin: { description: 'The image shown when your site is shared on social media (WhatsApp, Twitter, LinkedIn). Recommended size: 1200×630px.' } },
        { name: 'favicon', type: 'upload', relationTo: 'media', admin: { description: 'The tiny icon shown in the browser tab. Upload a square image (e.g., 32×32px or 64×64px PNG or ICO).' } },
        { name: 'logo_color', type: 'upload', relationTo: 'media', admin: { description: 'Your full colour logo — used on light backgrounds and brand materials.' } },
        { name: 'logo_white', type: 'upload', relationTo: 'media', admin: { description: 'White/transparent version of your logo — used on dark backgrounds and overlays.' } },
        { name: 'default_theme', type: 'text', defaultValue: 'cyber-gold', admin: { description: 'The colour theme applied on first visit (e.g., "cyber-gold", "matrix-green", "neon-blue"). Must match a theme key defined in your CSS.' } },
        { name: 'default_world', type: 'relationship', relationTo: 'worlds', admin: { description: 'Select the 3D World that loads when a visitor first arrives. Must be a World that has "Is Active" checked.' } },
        { name: 'boot_sequence_enabled', type: 'checkbox', defaultValue: true, admin: { description: 'Show the cinematic boot sequence animation when the site first loads. Uncheck to skip straight to the desktop.' } },
        { name: 'intro_scene_enabled', type: 'checkbox', defaultValue: true, admin: { description: 'Show the 3D camera fly-through intro scene after the boot sequence. Uncheck to go directly to the desktop.' } },
        { name: 'ambient_music_enabled', type: 'checkbox', defaultValue: false, admin: { description: 'Allow background ambient music to play. Visitors can always toggle this themselves in the settings.' } },
        { name: 'analytics_enabled', type: 'checkbox', defaultValue: true, admin: { description: 'Enable analytics tracking (Google Analytics / PostHog). Requires valid API keys below.' } },
        { name: 'maintenance_mode', type: 'checkbox', defaultValue: false, admin: { description: 'When checked, the site shows a maintenance page to all visitors. Only you (logged in) can access the full site.' } },
        { name: 'maintenance_message', type: 'text', admin: { description: 'The message shown to visitors during maintenance (e.g., "Back online in a few hours — upgrading the system!").' } },
        { name: 'social_links', type: 'json', admin: { description: 'JSON object of extra social links. Example: { "instagram": "https://instagram.com/yourhandle", "youtube": "https://youtube.com/@yourchannel" }' } },
        { name: 'contact_email', type: 'email', admin: { description: 'The email address that receives contact form submissions. If blank, falls back to the Portfolio Owner email.' } },
        { name: 'google_analytics_id', type: 'text', admin: { description: 'Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX). Leave blank to disable GA4 tracking.' } },
        { name: 'posthog_key', type: 'text', admin: { description: 'Your PostHog project API key for product analytics. Leave blank to disable PostHog.' } },
      ]
    },
    {
      slug: 'ai-settings',
      access: {
        read: () => true,
      },
      fields: [
        { name: 'provider', type: 'select', options: ['openrouter', 'openai'], defaultValue: 'openrouter', required: true },
        { name: 'model', type: 'text', defaultValue: 'google/gemini-2.5-flash', required: true },
        { name: 'temperature', type: 'number', defaultValue: 0.7, required: true },
        { name: 'max_tokens', type: 'number', defaultValue: 1000, required: true },
        { name: 'system_prompt', type: 'textarea', admin: { description: 'Override the default system prompt.' } },
        { name: 'fallback_provider', type: 'select', options: ['openrouter', 'openai', 'none'], defaultValue: 'openai', required: true },
        { name: 'fallback_model', type: 'text', defaultValue: 'gpt-4o', required: true },
      ]
    }
  ],
})
