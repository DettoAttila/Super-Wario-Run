import {collision_data} from './map.js';

export class Collision {
    constructor(tileSize) {
        this.tileSize = tileSize;
        this.loadedSections = new Map(); // sectionIndex -> collision objects
        this.heightMap = new Map(); // x -> y (per slopes semplici)
        this.complexShapes = new Map(); // world position -> SAT polygon
    }

    // Carica una sezione e converte i tile in collision objects
    loadSection(sectionData, offsetX, sectionIndex) {
        // Gestisce sia dati Tiled che la tua struttura Sezione
        let tilemap, width, height;
        
        if (sectionData.layers) {
            // Formato Tiled
            const collisionLayer = sectionData.layers.find(l => l.name === 'collision' || l.type === 'tilelayer');
            if (!collisionLayer) return;
            tilemap = collisionLayer.data;
            width = collisionLayer.width;
            height = collisionLayer.height;
        } else if (sectionData.fg_tilemap) {
            // Formato della tua Sezione
            tilemap = sectionData.fg_tilemap;
            width = sectionData.map_col;
            height = sectionData.map_row;
        } else {
            console.warn('Formato sezione non riconosciuto');
            return;
        }

        const sectionCollisions = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let tileId = tilemap[y * width + x];
                
                // Gestisci i flag di flip di Tiled se presenti
                if (tileId > 1000000) {
                    const HFLIP_FLAG = 0x80000000;
                    const VFLIP_FLAG = 0x40000000;
                    tileId = (tileId & ~(HFLIP_FLAG | VFLIP_FLAG)) - 1;
                } else if (tileId > 0) {
                    tileId = tileId - 1; // Converti da 1-based a 0-based se necessario
                }
                
                if (tileId > 0 && collision_data[tileId]) {
                    const worldX = (x * this.tileSize) + offsetX;
                    const worldY = y * this.tileSize;
                    
                    const collisionObjects = this.createCollisionObjects(
                        tileId, 
                        worldX, 
                        worldY
                    );
                    
                    sectionCollisions.push(...collisionObjects);
                }
            }
        }
        
        this.loadedSections.set(sectionIndex, sectionCollisions);
        console.log(`Caricata sezione ${sectionIndex} con ${sectionCollisions.length} collision objects`);
    }


    // Converte i dati tile in collision objects utilizzabili
    createCollisionObjects(tileId, worldX, worldY) {
        const tileCollisionData = collision_data[tileId];
        const objects = [];
        
        tileCollisionData.forEach(collisionShape => {
            const obj = {
                tileId: tileId,
                worldX: worldX,
                worldY: worldY,
                type: collisionShape.type,
                bounds: this.calculateBounds(collisionShape, worldX, worldY)
            };
            
            if (collisionShape.type === 'rect') {
                obj.rect = {
                    x: worldX + collisionShape.x,
                    y: worldY + collisionShape.y,
                    width: collisionShape.width,
                    height: collisionShape.height
                };
                
                // Per rettangoli orizzontali, crea heightmap
                if (collisionShape.height <= 4 && collisionShape.width === this.tileSize) {
                    this.createHeightMapFromRect(obj.rect);
                }
                
            } else if (collisionShape.type === 'poly') {
                obj.polygon = this.createPolygon(collisionShape, worldX, worldY);
                
                // Determina il tipo di slope per ottimizzazioni
                obj.slopeType = this.determineSlopeType(collisionShape.points);
                
                // Per slopes semplici, crea heightmap
                if (obj.slopeType !== 'complex') {
                    this.createHeightMapFromSlope(obj.polygon, worldX);
                } else {
                    // Per shapes complesse, prepara per SAT
                    this.createSATPolygon(obj);
                }
            }
            
            objects.push(obj);
        });
        
        return objects;
    }

    createPolygon(collisionShape, worldX, worldY) {
        const adjustedX = worldX + collisionShape.x;
        const adjustedY = worldY + collisionShape.y;
        
        return {
            x: adjustedX,
            y: adjustedY,
            points: collisionShape.points.map(point => ({
                x: point[0],
                y: point[1]
            })),
            worldPoints: collisionShape.points.map(point => ({
                x: adjustedX + point[0],
                y: adjustedY + point[1]
            }))
        };
    }

    determineSlopeType(points) {
        // Analizza i punti per determinare il tipo di slope
        if (points.length <= 3) {
            // Controlla se è un triangolo retto (slope semplice)
            const hasRightAngle = this.hasRightAngle(points);
            if (hasRightAngle) {
                return this.isHorizontalSlope(points) ? 'horizontal_slope' : 'vertical_slope';
            }
        }
        return 'complex';
    }

    hasRightAngle(points) {
        // Semplice check per angoli retti (90°)
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];
            
            const dx1 = p2[0] - p1[0];
            const dy1 = p2[1] - p1[1];
            const dx2 = p3[0] - p2[0];
            const dy2 = p3[1] - p2[1];
            
            // Prodotto scalare per angolo retto
            if (Math.abs(dx1 * dx2 + dy1 * dy2) < 0.1) {
                return true;
            }
        }
        return false;
    }

    isHorizontalSlope(points) {
        // Controlla se la slope è principalmente orizzontale
        const minY = Math.min(...points.map(p => p[1]));
        const maxY = Math.max(...points.map(p => p[1]));
        const minX = Math.min(...points.map(p => p[0]));
        const maxX = Math.max(...points.map(p => p[0]));
        
        return (maxX - minX) > (maxY - minY);
    }

    createHeightMapFromRect(rect) {
        // Crea heightmap per rettangoli (piattaforme)
        for (let x = rect.x; x < rect.x + rect.width; x++) {
            const currentHeight = this.heightMap.get(x);
            if (!currentHeight || rect.y < currentHeight) {
                this.heightMap.set(x, rect.y);
            }
        }
    }

    createHeightMapFromSlope(polygon, startX) {
        // Crea heightmap per slopes semplici
        const minX = Math.min(...polygon.worldPoints.map(p => p.x));
        const maxX = Math.max(...polygon.worldPoints.map(p => p.x));
        
        for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
            const y = this.getPolygonHeightAtX(polygon, x);
            if (y !== null) {
                const currentHeight = this.heightMap.get(x);
                if (!currentHeight || y < currentHeight) {
                    this.heightMap.set(x, y);
                }
            }
        }
    }

    getPolygonHeightAtX(polygon, x) {
        // Trova l'intersezione verticale con il poligono
        const points = polygon.worldPoints;
        let minY = null;
        
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            // Check se la linea attraversa la x
            if ((p1.x <= x && x <= p2.x) || (p2.x <= x && x <= p1.x)) {
                if (p1.x === p2.x) {
                    // Linea verticale
                    continue;
                }
                
                // Calcola intersezione
                const t = (x - p1.x) / (p2.x - p1.x);
                const y = p1.y + t * (p2.y - p1.y);
                
                if (minY === null || y < minY) {
                    minY = y;
                }
            }
        }
        
        return minY;
    }

    createSATPolygon(collisionObj) {
        // Prepara il poligono per SAT.js (se disponibile)
        if (typeof SAT !== 'undefined') {
            const satPoints = collisionObj.polygon.worldPoints.map(p => 
                new SAT.Vector(p.x, p.y)
            );
            collisionObj.satPolygon = new SAT.Polygon(new SAT.Vector(0, 0), satPoints);
        }
    }

    calculateBounds(collisionShape, worldX, worldY) {
        let minX, minY, maxX, maxY;
        
        if (collisionShape.type === 'rect') {
            minX = worldX + collisionShape.x;
            minY = worldY + collisionShape.y;
            maxX = minX + collisionShape.width;
            maxY = minY + collisionShape.height;
        } else {
            const adjustedX = worldX + collisionShape.x;
            const adjustedY = worldY + collisionShape.y;
            
            minX = adjustedX + Math.min(...collisionShape.points.map(p => p[0]));
            minY = adjustedY + Math.min(...collisionShape.points.map(p => p[1]));
            maxX = adjustedX + Math.max(...collisionShape.points.map(p => p[0]));
            maxY = adjustedY + Math.max(...collisionShape.points.map(p => p[1]));
        }
        
        return { minX, minY, maxX, maxY };
    }

    // Funzione principale per il collision check
    checkCollision(gameObject) {
        // Prima prova il check veloce con heightmap
        const heightMapResult = this.checkHeightMapCollision(gameObject);
        if (heightMapResult) {
            return heightMapResult;
        }
        
        // Poi cerca collision objects nell'area
        const candidates = this.getCollisionCandidates(gameObject);
        
        for (const collisionObj of candidates) {
            const result = this.checkObjectCollision(gameObject, collisionObj);
            if (result) {
                return result;
            }
        }
        
        return null;
    }

    checkHeightMapCollision(gameObject) {
        // Solo per oggetti che cadono
        if (gameObject.velocityY <= 0) return null;
        
        const centerX = Math.floor(gameObject.x + gameObject.width / 2);
        const bottomY = gameObject.y + gameObject.height;
        
        const groundY = this.heightMap.get(centerX);
        
        if (groundY !== undefined && bottomY >= groundY) {
            // Calcola slope per movimento fluido
            const leftHeight = this.heightMap.get(centerX - 1);
            const rightHeight = this.heightMap.get(centerX + 1);
            
            let slope = 0;
            if (leftHeight !== undefined && rightHeight !== undefined) {
                slope = (rightHeight - leftHeight) / 2;
            }
            
            return {
                type: 'ground',
                y: groundY - gameObject.height,
                slope: slope,
                method: 'heightmap'
            };
        }
        
        return null;
    }

    getCollisionCandidates(gameObject) {
        const candidates = [];
        const buffer = 32; // Area di ricerca ampliata
        
        const searchBounds = {
            minX: gameObject.x - buffer,
            minY: gameObject.y - buffer,
            maxX: gameObject.x + gameObject.width + buffer,
            maxY: gameObject.y + gameObject.height + buffer
        };
        
        // Cerca in tutte le sezioni caricate
        for (const [sectionIndex, collisionObjects] of this.loadedSections) {
            for (const obj of collisionObjects) {
                // Broad phase: check bounding boxes
                if (this.boundsOverlap(searchBounds, obj.bounds)) {
                    candidates.push(obj);
                }
            }
        }
        
        return candidates;
    }

    boundsOverlap(bounds1, bounds2) {
        return bounds1.minX < bounds2.maxX &&
               bounds1.maxX > bounds2.minX &&
               bounds1.minY < bounds2.maxY &&
               bounds1.maxY > bounds2.minY;
    }

    checkObjectCollision(gameObject, collisionObj) {
        if (collisionObj.type === 'rect') {
            return this.checkRectCollision(gameObject, collisionObj.rect);
        } else if (collisionObj.type === 'poly') {
            if (collisionObj.slopeType === 'complex' && collisionObj.satPolygon) {
                return this.checkSATCollision(gameObject, collisionObj);
            } else {
                return this.checkSimplePolygonCollision(gameObject, collisionObj);
            }
        }
        
        return null;
    }

    checkRectCollision(gameObject, rect) {
        if (gameObject.x < rect.x + rect.width &&
            gameObject.x + gameObject.width > rect.x &&
            gameObject.y < rect.y + rect.height &&
            gameObject.y + gameObject.height > rect.y) {
            
            // Determina la direzione della collision
            const overlapX = Math.min(gameObject.x + gameObject.width - rect.x, 
                                    rect.x + rect.width - gameObject.x);
            const overlapY = Math.min(gameObject.y + gameObject.height - rect.y, 
                                    rect.y + rect.height - gameObject.y);
            
            if (overlapX < overlapY) {
                // Collision orizzontale
                return {
                    type: gameObject.x < rect.x ? 'wall' : 'wall',
                    x: gameObject.x < rect.x ? rect.x - gameObject.width : rect.x + rect.width,
                    method: 'rect'
                };
            } else {
                // Collision verticale
                return {
                    type: gameObject.y < rect.y ? 'ceiling' : 'ground',
                    y: gameObject.y < rect.y ? rect.y - gameObject.height : rect.y,
                    method: 'rect'
                };
            }
        }
        
        return null;
    }

    checkSimplePolygonCollision(gameObject, collisionObj) {
        // Per slopes semplici, usa point-in-polygon test
        const gameObjectCenter = {
            x: gameObject.x + gameObject.width / 2,
            y: gameObject.y + gameObject.height / 2
        };
        
        if (this.pointInPolygon(gameObjectCenter, collisionObj.polygon.worldPoints)) {
            // Trova il punto più vicino sul poligono per determinare la direzione
            const closestPoint = this.findClosestPointOnPolygon(gameObjectCenter, collisionObj.polygon);
            
            return {
                type: 'ground', // Per semplicità, assumiamo sia sempre ground per slopes
                y: closestPoint.y - gameObject.height,
                slope: this.calculateSlopeAtPoint(closestPoint, collisionObj.polygon),
                method: 'simple_polygon'
            };
        }
        
        return null;
    }

    checkSATCollision(gameObject, collisionObj) {
        if (typeof SAT === 'undefined') {
            console.warn('SAT.js non disponibile, fallback a simple polygon');
            return this.checkSimplePolygonCollision(gameObject, collisionObj);
        }
        
        // Crea un rettangolo SAT per il game object
        const gameObjectSAT = new SAT.Box(
            new SAT.Vector(gameObject.x, gameObject.y),
            gameObject.width,
            gameObject.height
        ).toPolygon();
        
        const response = new SAT.Response();
        const collided = SAT.testPolygonPolygon(gameObjectSAT, collisionObj.satPolygon, response);
        
        if (collided) {
            return {
                type: 'ground', // Determina tipo basandosi su MTV
                x: gameObject.x - response.overlapV.x,
                y: gameObject.y - response.overlapV.y,
                mtv: response.overlapV,
                method: 'sat'
            };
        }
        
        return null;
    }

    pointInPolygon(point, polygonPoints) {
        let inside = false;
        const x = point.x, y = point.y;
        
        for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
            const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
            const xj = polygonPoints[j].x, yj = polygonPoints[j].y;
            
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        
        return inside;
    }

    findClosestPointOnPolygon(point, polygon) {
        // Implementazione semplificata - trova il punto più vicino sui bordi
        let closestPoint = null;
        let minDistance = Infinity;
        
        const points = polygon.worldPoints;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            const closestOnSegment = this.closestPointOnSegment(point, p1, p2);
            const distance = Math.sqrt(
                Math.pow(point.x - closestOnSegment.x, 2) + 
                Math.pow(point.y - closestOnSegment.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = closestOnSegment;
            }
        }
        
        return closestPoint;
    }

    closestPointOnSegment(point, segmentStart, segmentEnd) {
        const dx = segmentEnd.x - segmentStart.x;
        const dy = segmentEnd.y - segmentStart.y;
        
        if (dx === 0 && dy === 0) {
            return segmentStart;
        }
        
        const t = Math.max(0, Math.min(1, 
            ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / (dx * dx + dy * dy)
        ));
        
        return {
            x: segmentStart.x + t * dx,
            y: segmentStart.y + t * dy
        };
    }

    calculateSlopeAtPoint(point, polygon) {
        // Calcola l'inclinazione locale del poligono
        // Implementazione semplificata
        return 0;
    }

    // Rimuove una sezione dalla memoria
    unloadSection(sectionIndex) {
        this.loadedSections.delete(sectionIndex);
        
        // Rimuovi heightmap entries per questa sezione
        const sectionStartX = sectionIndex * 640; // Assumendo larghezza sezione di 640
        const sectionEndX = sectionStartX + 640;
        
        for (let x = sectionStartX; x < sectionEndX; x++) {
            this.heightMap.delete(x);
        }
        
        console.log(`Sezione ${sectionIndex} rimossa dalla collision system`);
    }

    // Debug: disegna le collision shapes
    debugRender(ctx, camera) {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        
        // Disegna heightmap
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const sortedHeights = Array.from(this.heightMap.entries()).sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < sortedHeights.length - 1; i++) {
            const [x1, y1] = sortedHeights[i];
            const [x2, y2] = sortedHeights[i + 1];
            if (i === 0) ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        
        // Disegna collision objects
        for (const [sectionIndex, collisionObjects] of this.loadedSections) {
            for (const obj of collisionObjects) {
                if (obj.type === 'rect') {
                    ctx.strokeStyle = 'red';
                    ctx.strokeRect(obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
                } else if (obj.type === 'poly') {
                    ctx.strokeStyle = obj.slopeType === 'complex' ? 'blue' : 'green';
                    ctx.beginPath();
                    const points = obj.polygon.worldPoints;
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }
}

/*
export function check_collisione(player) {
    const tiles_vicini = getTilesVicini(player);
    
    for (let tile of tiles_vicini) {
        if (haCollisione(player, tile)) {
            return true;
        }
    }
    return false;
}

// Funzione per risolvere tutte le collisioni del player
export function risolviCollisioni(player) {
    // Prima risolvi collisioni orizzontali
    risolviCollisioniOrizzontali(player);
    
    // Poi risolvi collisioni verticali
    risolviCollisioniVerticali(player);
}

// Risolvi collisioni orizzontali
function risolviCollisioniOrizzontali(player) {
    const tiles_vicini = getTilesVicini(player);
    
    for (let tile of tiles_vicini) {
        const tile_collision_box = getTileCollisionBox(tile);
        if (!tile_collision_box) continue;
        
        const response = new SAT.Response();
        if (SAT.testPolygonPolygon(player.collision_box, tile_collision_box, response)) {
            // Se c'è sovrapposizione orizzontale, risolvi
            if (Math.abs(response.overlapV.x) > 0) {
                player.x -= response.overlapV.x;
                player.rincorsa = 0;
                
                // Aggiorna la collision box del player
                player.collision_box.pos.x = player.x;
            }
        }
    }
}

// Risolvi collisioni verticali
function risolviCollisioniVerticali(player) {
    const tiles_vicini = getTilesVicini(player);
    let player_a_terra = false;
    
    for (let tile of tiles_vicini) {
        const tile_collision_box = getTileCollisionBox(tile);
        if (!tile_collision_box) continue;
        
        const response = new SAT.Response();
        if (SAT.testPolygonPolygon(player.collision_box, tile_collision_box, response)) {
            // Se c'è sovrapposizione verticale, risolvi
            if (Math.abs(response.overlapV.y) > 0) {
                player.y -= response.overlapV.y;
                
                // Se stava cadendo (salto > 0), è atterrato
                if (player.salto > 0) {
                    player_a_terra = true;
                }
                
                player.salto = 0;
                
                // Aggiorna la collision box del player
                player.collision_box.pos.y = player.y;
            }
        }
    }
    
    return player_a_terra;
}

// Verifica se il player ha una collisione con un tile specifico
function haCollisione(player, tile) {
    const tile_collision_box = getTileCollisionBox(tile);
    if (!tile_collision_box) return false;
    
    return SAT.testPolygonPolygon(player.collision_box, tile_collision_box);
}

// Ottieni tutti i tile vicini al player che potrebbero avere collisioni
function getTilesVicini(player) {
    const tiles = [];
    const margin = tile_size;
    
    // Calcola l'area da controllare
    const start_x = Math.floor((player.x - margin) / tile_size);
    const end_x = Math.floor((player.x + player.width + margin) / tile_size);
    const start_y = Math.floor((player.y - margin) / tile_size);
    const end_y = Math.floor((player.y + player.height + margin) / tile_size);
    
    let col_offset = 0;
    
    // Controlla ogni sezione nel buffer
    for (const sezione of buffer_sezioni) {
        const { fg_tilemap, map_col, map_row } = sezione;
        
        for (let tile_y = start_y; tile_y <= end_y; tile_y++) {
            if (tile_y < 0 || tile_y >= map_row) continue;
            
            for (let tile_x = start_x; tile_x <= end_x; tile_x++) {
                const tile_x_local = tile_x - col_offset;
                
                if (tile_x_local < 0 || tile_x_local >= map_col) continue;
                
                const index = tile_y * map_col + tile_x_local;
                const tile_id = fg_tilemap[index];
                
                if (tile_id && tile_id > 0) {
                    // Rimuovi i flag di flip per ottenere il vero ID del tile
                    const HFLIP_FLAG = 0x80000000;
                    const VFLIP_FLAG = 0x40000000;
                    const clean_tile_id = (tile_id & ~(HFLIP_FLAG | VFLIP_FLAG));
                    
                    tiles.push({
                        tile_x: tile_x,
                        tile_y: tile_y,
                        tile_id: clean_tile_id,
                        world_x: tile_x * tile_size,
                        world_y: tile_y * tile_size
                    });
                }
            }
        }
        
        col_offset += map_col;
    }
    
    return tiles;
}

// Crea il collision box SAT per un tile specifico
function getTileCollisionBox(tile) {
    const collision_info = collision_data[tile.tile_id];
    
    if (!collision_info || collision_info.length === 0) {
        return null; // Nessuna collisione per questo tile
    }
    
    // Prendi il primo elemento di collisione (puoi estendere per gestire multipli)
    const collision = collision_info[0];
    
    if (collision.type === "rect") {
        // Collision box rettangolare
        return new SAT.Box(
            new SAT.Vector(
                tile.world_x + collision.x,
                tile.world_y + collision.y
            ),
            collision.width,
            collision.height
        ).toPolygon();
        
    } else if (collision.type === "poly") {
        // Collision box poligonale
        const points = collision.points.map(point => 
            new SAT.Vector(point[0], point[1])
        );
        
        const polygon = new SAT.Polygon(
            new SAT.Vector(
                tile.world_x + collision.x,
                tile.world_y + collision.y
            ),
            points
        );
        
        return polygon;
    }
    
    return null;
}

// Funzione per controllare se il player può saltare (è a terra)
export function puoSaltare(player) {
    // Crea un box leggermente sotto il player per controllare il terreno
    const ground_check_box = new SAT.Box(
        new SAT.Vector(player.x + 2, player.y + player.height),
        player.width - 4,
        2
    ).toPolygon();
    
    const tiles_vicini = getTilesVicini(player);
    
    for (let tile of tiles_vicini) {
        const tile_collision_box = getTileCollisionBox(tile);
        if (!tile_collision_box) continue;
        
        if (SAT.testPolygonPolygon(ground_check_box, tile_collision_box)) {
            return true;
        }
    }
    
    return false;
}
    */