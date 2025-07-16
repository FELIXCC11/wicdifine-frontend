// src/libs/db/schema.ts
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
  documents: many(documents),
}));

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  title: text('title'),
  visibility: text('visibility', { enum: ['private', 'public', 'unlisted'] }).default('private'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  parts: text('parts').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  attachments: text('attachments').array(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  kind: text('kind', { enum: ['text', 'code', 'image', 'sheet'] }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  visibility: text('visibility', { enum: ['private', 'public', 'unlisted'] }).default('private'),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  suggestions: many(suggestions),
}));

export const suggestions = pgTable('suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id),
  userId: uuid('user_id').references(() => users.id),
  originalText: text('original_text').notNull(),
  suggestedText: text('suggested_text').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  documentCreatedAt: timestamp('document_created_at'),
  isResolved: boolean('is_resolved').default(false),
});

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  document: one(documents, {
    fields: [suggestions.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [suggestions.userId],
    references: [users.id],
  }),
}));

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id),
  messageId: uuid('message_id').references(() => messages.id),
  isUpvoted: boolean('is_upvoted').notNull(),
});

export const votesRelations = relations(votes, ({ one }) => ({
  chat: one(chats, {
    fields: [votes.chatId],
    references: [chats.id],
  }),
  message: one(messages, {
    fields: [votes.messageId],
    references: [messages.id],
  }),
}));

// Type exports for backward compatibility
export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;
export type Vote = typeof votes.$inferSelect;

export type VisibilityType = 'private' | 'public' | 'unlisted';
export type ArtifactKind = 'text' | 'code' | 'image' | 'sheet';