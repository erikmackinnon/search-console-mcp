// @ts-ignore
import Validator from '@adobe/structured-data-validator';
import * as cheerio from 'cheerio';

interface ValidationResult {
    valid: boolean;
    errors: any[];
    schemas: any[];
}

export async function validateSchema(
    input: string,
    type: 'url' | 'html' | 'json'
): Promise<ValidationResult> {
    let schemas: any[] = [];
    const errors: any[] = [];

    try {
        if (type === 'url') {
            try {
                const response = await fetch(input);
                if (!response.ok) {
                    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
                }
                const html = await response.text();
                schemas = extractSchemas(html);
            } catch (e: any) {
                return { valid: false, errors: [`Fetch error: ${e.message}`], schemas: [] };
            }
        } else if (type === 'html') {
            schemas = extractSchemas(input);
        } else if (type === 'json') {
            try {
                const parsed = JSON.parse(input);
                schemas = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e: any) {
                return { valid: false, errors: [`JSON Parse error: ${e.message}`], schemas: [] };
            }
        }

        if (schemas.length === 0) {
            return { valid: false, errors: ["No structured data (JSON-LD) found"], schemas: [] };
        }

        const validationPromises = schemas.map(async (schema) => {
            const validator = new Validator();
            try {
                const result = await validator.validate(schema);
                if (result && Array.isArray(result) && result.length > 0) {
                    // result is array of errors
                    return result.map((err: any) => ({
                        ...err,
                        schemaType: schema['@type'] || 'Unknown'
                    }));
                }
                return [];
            } catch (e: any) {
                return [{ message: `Validation exception: ${e.message}`, schemaType: schema['@type'] || 'Unknown' }];
            }
        });

        const results = await Promise.all(validationPromises);
        errors.push(...results.flat());

        return {
            valid: errors.length === 0,
            errors,
            schemas
        };

    } catch (err: any) {
        return { valid: false, errors: [err.message], schemas: [] };
    }
}

function extractSchemas(html: string): any[] {
    const $ = cheerio.load(html);
    const schemas: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const content = $(el).html();
            if (content) {
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    schemas.push(...parsed);
                } else {
                    schemas.push(parsed);
                }
            }
        } catch (e) {
            // ignore invalid json blocks
        }
    });
    return schemas;
}
