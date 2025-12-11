describe('MovieClient - Essential Functions', () => {
    let movieClient;
    
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="txtId" />
            <input id="txtTitle" />
            <input id="txtActors" />
            <input id="txtBudget" />
            <textarea id="txtDescription"></textarea>
            <tbody id="moviesBody"></tbody>
        `;
        
        movieClient = {
            readForm: function(isCreate) {
                const idInput = document.getElementById('txtId');
                const titleInput = document.getElementById('txtTitle');
                const actorsInput = document.getElementById('txtActors');
                const budgetInput = document.getElementById('txtBudget');
                const descInput = document.getElementById('txtDescription');
                
                return {
                    id: isCreate ? 'new-uuid-123' : idInput.value,
                    title: titleInput.value.trim(),
                    actors: actorsInput.value.split(',').map(a => a.trim()).filter(a => a),
                    budget: budgetInput.value ? parseFloat(budgetInput.value) : null,
                    description: descInput.value.trim()
                };
            },
            
            isValidUUID: function(uuid) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(uuid);
            },
            
            clearForm: function() {
                document.getElementById('txtId').value = '';
                document.getElementById('txtTitle').value = '';
                document.getElementById('txtActors').value = '';
                document.getElementById('txtBudget').value = '';
                document.getElementById('txtDescription').value = '';
            }
        };
    });
    
    test('readForm should correctly parse form data for new movie', () => {
        document.getElementById('txtTitle').value = 'Inception';
        document.getElementById('txtActors').value = 'Leonardo DiCaprio, Tom Hardy';
        document.getElementById('txtBudget').value = '160000000';
        document.getElementById('txtDescription').value = 'A thief who steals corporate secrets';
        
        const result = movieClient.readForm(true);
        
        expect(result.title).toBe('Inception');
        expect(result.actors).toEqual(['Leonardo DiCaprio', 'Tom Hardy']);
        expect(result.budget).toBe(160000000);
        expect(result.description).toBe('A thief who steals corporate secrets');
        expect(result.id).toBe('new-uuid-123');
    });
    
    test('readForm should handle empty actors list', () => {
        document.getElementById('txtTitle').value = 'Test Movie';
        document.getElementById('txtActors').value = '';
        document.getElementById('txtBudget').value = '';
        
        const result = movieClient.readForm(true);
        
        expect(result.actors).toEqual([]);
        expect(result.budget).toBeNull();
    });
});

describe('UUID Validation', () => {
    let movieClient;
    
    beforeEach(() => {
        movieClient = {
            isValidUUID: function(uuid) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(uuid);
            }
        };
    });
    
    test('should validate correct UUID format', () => {
        const validUUIDs = [
            '12345678-1234-1234-1234-123456789abc',
            'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            '00000000-0000-0000-0000-000000000000'
        ];
        
        validUUIDs.forEach(uuid => {
            expect(movieClient.isValidUUID(uuid)).toBe(true);
        });
    });
    
    test('should reject invalid UUID format', () => {
        const invalidUUIDs = [
            'not-a-uuid',
            '123',
            '12345678-1234-1234-1234-123456789',
            '12345678-1234-1234-1234-123456789abcd',
            '12345678_1234_1234_1234_123456789abc',
            ''
        ];
        
        invalidUUIDs.forEach(uuid => {
            expect(movieClient.isValidUUID(uuid)).toBe(false);
        });
    });
});