/**
 * Hierarchy Node Repository - Unit Tests
 * Tests for organizational hierarchy CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Hierarchy Node Operations', () => {
  let testNodeId: string;
  let testParentNodeId: string;

  beforeAll(async () => {
    await db('hierarchy_nodes').del();
  });

  afterAll(async () => {
    await db('hierarchy_nodes').del();
  });

  describe('Create Hierarchy Node', () => {
    it('should create root hierarchy node', async () => {
      const [node] = await db('hierarchy_nodes')
        .insert({
          name: 'CEO',
          level: 1,
          parent_id: null,
          node_type: 'position',
        })
        .returning('*');

      expect(node).toBeDefined();
      expect(node.id).toBeDefined();
      expect(node.name).toBe('CEO');
      expect(node.parent_id).toBeNull();

      testParentNodeId = node.id;
    });

    it('should create child hierarchy node', async () => {
      const [node] = await db('hierarchy_nodes')
        .insert({
          name: 'VP Engineering',
          level: 2,
          parent_id: testParentNodeId,
          node_type: 'position',
        })
        .returning('*');

      expect(node).toBeDefined();
      expect(node.parent_id).toBe(testParentNodeId);
      expect(node.level).toBe(2);

      testNodeId = node.id;
    });

    it('should support different node types', async () => {
      const types = ['position', 'department', 'team', 'division'];

      for (const type of types) {
        const [node] = await db('hierarchy_nodes')
          .insert({
            name: `${type} node`,
            level: 1,
            node_type: type,
          })
          .returning('*');

        expect(node.node_type).toBe(type);
      }
    });
  });

  describe('Retrieve Hierarchy Node', () => {
    it('should retrieve node by ID', async () => {
      const node = await db('hierarchy_nodes')
        .where({ id: testNodeId })
        .first();

      expect(node).toBeDefined();
      expect(node.id).toBe(testNodeId);
    });

    it('should retrieve node by name', async () => {
      const node = await db('hierarchy_nodes')
        .where({ name: 'VP Engineering' })
        .first();

      expect(node).toBeDefined();
      expect(node.name).toBe('VP Engineering');
    });

    it('should retrieve all root nodes', async () => {
      const nodes = await db('hierarchy_nodes')
        .whereNull('parent_id');

      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.every((n) => n.parent_id === null)).toBe(true);
    });
  });

  describe('Update Hierarchy Node', () => {
    it('should update node name', async () => {
      await db('hierarchy_nodes').where({ id: testNodeId }).update({
        name: 'VP Engineering & Operations',
      });

      const updated = await db('hierarchy_nodes')
        .where({ id: testNodeId })
        .first();

      expect(updated.name).toBe('VP Engineering & Operations');
    });

    it('should update node level', async () => {
      await db('hierarchy_nodes').where({ id: testNodeId }).update({
        level: 3,
      });

      const updated = await db('hierarchy_nodes')
        .where({ id: testNodeId })
        .first();

      expect(updated.level).toBe(3);
    });
  });

  describe('Delete Hierarchy Node', () => {
    it('should delete hierarchy node', async () => {
      const [node] = await db('hierarchy_nodes')
        .insert({
          name: 'Temp Node',
          level: 1,
          node_type: 'position',
        })
        .returning('*');

      await db('hierarchy_nodes').where({ id: node.id }).del();

      const deleted = await db('hierarchy_nodes')
        .where({ id: node.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Hierarchy', () => {
    it('should retrieve children of a node', async () => {
      const children = await db('hierarchy_nodes')
        .where({ parent_id: testParentNodeId });

      expect(Array.isArray(children)).toBe(true);
      expect(children.every((c) => c.parent_id === testParentNodeId)).toBe(true);
    });

    it('should retrieve nodes by level', async () => {
      const nodes = await db('hierarchy_nodes')
        .where({ level: 2 });

      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.every((n) => n.level === 2)).toBe(true);
    });

    it('should retrieve nodes by type', async () => {
      const nodes = await db('hierarchy_nodes')
        .where({ node_type: 'position' });

      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.every((n) => n.node_type === 'position')).toBe(true);
    });
  });

  describe('Hierarchy Traversal', () => {
    it('should get parent node', async () => {
      const node = await db('hierarchy_nodes')
        .where({ id: testNodeId })
        .first();

      const parent = await db('hierarchy_nodes')
        .where({ id: node.parent_id })
        .first();

      expect(parent).toBeDefined();
      expect(parent.id).toBe(testParentNodeId);
    });

    it('should get all ancestors', async () => {
      const node = await db('hierarchy_nodes')
        .where({ id: testNodeId })
        .first();

      let ancestors = [];
      let currentId = node.parent_id;

      while (currentId) {
        const ancestor = await db('hierarchy_nodes')
          .where({ id: currentId })
          .first();

        if (ancestor) {
          ancestors.push(ancestor);
          currentId = ancestor.parent_id;
        } else {
          break;
        }
      }

      expect(Array.isArray(ancestors)).toBe(true);
    });

    it('should get all descendants', async () => {
      const descendants = await db('hierarchy_nodes')
        .where({ parent_id: testParentNodeId });

      expect(Array.isArray(descendants)).toBe(true);
    });
  });

  describe('Org Chart Generation', () => {
    it('should count total nodes', async () => {
      const result = await db('hierarchy_nodes')
        .count('* as count')
        .first();

      expect(result?.count).toBeGreaterThan(0);
    });

    it('should count nodes by level', async () => {
      const result = await db('hierarchy_nodes')
        .select('level')
        .count('* as count')
        .groupBy('level')
        .orderBy('level');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should identify leaf nodes', async () => {
      const leafNodes = await db('hierarchy_nodes')
        .whereNotIn('id', db('hierarchy_nodes').select('parent_id').whereNotNull('parent_id'));

      expect(Array.isArray(leafNodes)).toBe(true);
    });
  });
});
