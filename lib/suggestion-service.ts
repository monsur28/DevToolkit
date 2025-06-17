import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import { SuggestionDocument } from './models/System';
import { EmailService } from './email-service';
import { AuthService } from './auth-service';

export class SuggestionService {
  private static suggestionsCollection = () => getCollection('suggestions');

  static async createSuggestion(
    userId: string,
    type: SuggestionDocument['type'],
    category: SuggestionDocument['category'],
    title: string,
    description: string,
    attachments: SuggestionDocument['attachments'] = []
  ): Promise<SuggestionDocument> {
    const collection = await this.suggestionsCollection();
    const userObjectId = new ObjectId(userId);

    const suggestion: SuggestionDocument = {
      userId: userObjectId,
      type,
      category,
      title,
      description,
      priority: 'medium',
      status: 'pending',
      votes: {
        upvotes: 0,
        downvotes: 0,
        voters: [],
      },
      implementation: {
        estimatedEffort: 'medium',
      },
      attachments,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const result = await collection.insertOne(suggestion);
    
    // Log activity
    await AuthService.logActivity(
      userObjectId,
      'suggestion_created',
      'system',
      { 
        description: `Created ${type}: ${title}`,
        metadata: { suggestionId: result.insertedId.toString() }
      },
      'success'
    );

    return { ...suggestion, _id: result.insertedId };
  }

  static async getSuggestionsByUser(userId: string): Promise<SuggestionDocument[]> {
    const collection = await this.suggestionsCollection();
    const userObjectId = new ObjectId(userId);

    return await collection
      .find({ userId: userObjectId })
      .sort({ 'metadata.createdAt': -1 })
      .toArray() as SuggestionDocument[];
  }

  static async getAllSuggestions(
    status?: SuggestionDocument['status'],
    type?: SuggestionDocument['type'],
    limit: number = 50
  ): Promise<SuggestionDocument[]> {
    const collection = await this.suggestionsCollection();
    const query: any = {};

    if (status) query.status = status;
    if (type) query.type = type;

    return await collection
      .find(query)
      .sort({ 'metadata.createdAt': -1 })
      .limit(limit)
      .toArray() as SuggestionDocument[];
  }

  static async getSuggestionById(id: string): Promise<SuggestionDocument | null> {
    const collection = await this.suggestionsCollection();
    const objectId = new ObjectId(id);

    return await collection.findOne({ _id: objectId }) as SuggestionDocument | null;
  }

  static async updateSuggestionStatus(
    suggestionId: string,
    status: SuggestionDocument['status'],
    adminId: string,
    adminResponse?: string
  ): Promise<boolean> {
    const collection = await this.suggestionsCollection();
    const suggestionObjectId = new ObjectId(suggestionId);
    const adminObjectId = new ObjectId(adminId);

    const updateData: any = {
      status,
      'metadata.updatedAt': new Date(),
    };

    if (adminResponse) {
      updateData.adminResponse = {
        message: adminResponse,
        respondedBy: adminObjectId,
        respondedAt: new Date(),
      };
    }

    if (status === 'implemented') {
      updateData['metadata.implementedAt'] = new Date();
    }

    const result = await collection.updateOne(
      { _id: suggestionObjectId },
      { $set: updateData }
    );

    if (result.modifiedCount > 0 && adminResponse) {
      // Send email notification to user
      try {
        const suggestion = await this.getSuggestionById(suggestionId);
        if (suggestion) {
          const user = await AuthService.getUserById(suggestion.userId);
          if (user && user.preferences.notifications.email) {
            await EmailService.sendAdminResponseEmail(
              user.email,
              suggestion.title,
              adminResponse
            );
          }
        }
      } catch (error) {
        console.error('Failed to send admin response email:', error);
      }

      // Log activity
      await AuthService.logActivity(
        adminObjectId,
        'suggestion_responded',
        'admin',
        { 
          description: `Responded to suggestion: ${suggestionId}`,
          metadata: { suggestionId, status, response: adminResponse }
        },
        'success'
      );
    }

    return result.modifiedCount > 0;
  }

  static async voteSuggestion(
    suggestionId: string,
    userId: string,
    voteType: 'upvote' | 'downvote'
  ): Promise<boolean> {
    const collection = await this.suggestionsCollection();
    const suggestionObjectId = new ObjectId(suggestionId);
    const userObjectId = new ObjectId(userId);

    const suggestion = await collection.findOne({ _id: suggestionObjectId }) as SuggestionDocument | null;
    if (!suggestion) return false;

    // Check if user already voted
    const hasVoted = suggestion.votes.voters.some(voterId => voterId.toString() === userId);
    if (hasVoted) return false;

    const updateData: any = {
      'metadata.updatedAt': new Date(),
      $push: { 'votes.voters': userObjectId },
    };

    if (voteType === 'upvote') {
      updateData.$inc = { 'votes.upvotes': 1 };
    } else {
      updateData.$inc = { 'votes.downvotes': 1 };
    }

    const result = await collection.updateOne(
      { _id: suggestionObjectId },
      updateData
    );

    return result.modifiedCount > 0;
  }

  static async getSuggestionStats(): Promise<{
    total: number;
    pending: number;
    reviewing: number;
    approved: number;
    implemented: number;
    rejected: number;
  }> {
    const collection = await this.suggestionsCollection();

    const stats = await collection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const result = {
      total: 0,
      pending: 0,
      reviewing: 0,
      approved: 0,
      implemented: 0,
      rejected: 0,
    };

    stats.forEach(stat => {
      result[stat._id as keyof typeof result] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  static async getTopSuggestions(limit: number = 10): Promise<SuggestionDocument[]> {
    const collection = await this.suggestionsCollection();

    return await collection
      .find({ status: { $in: ['pending', 'reviewing', 'approved'] } })
      .sort({ 'votes.upvotes': -1, 'metadata.createdAt': -1 })
      .limit(limit)
      .toArray() as SuggestionDocument[];
  }
}