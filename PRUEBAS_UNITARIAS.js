/**
 * PRUEBAS UNITARIAS SIMPLES (sin framework)
 *
 * Ejecuta validaciones unitarias sobre funciones y middlewares clave.
 * Uso: node PRUEBAS_UNITARIAS.js
 */

const jwt = require('./backend/node_modules/jsonwebtoken');
const { verifyToken, verifyAdmin, verifyContador } = require('./backend/middleware/auth');
const AuditLog = require('./backend/models/AuditLog');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'clave_pruebas_local';

let total = 0;
let passed = 0;

function test(nombre, fn) {
    total += 1;
    try {
        fn();
        passed += 1;
        console.log(`OK   ${nombre}`);
    } catch (error) {
        console.error(`FAIL ${nombre}`);
        console.error(`     ${error.message}`);
    }
}

function assert(condicion, mensaje) {
    if (!condicion) {
        throw new Error(mensaje);
    }
}

function crearRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

function crearReqConToken(payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return {
        headers: {
            authorization: `Bearer ${token}`
        }
    };
}

test('AuditLog._toSafeInt retorna fallback con texto invalido', () => {
    const valor = AuditLog._toSafeInt('abc', 50, { min: 1, max: 100 });
    assert(valor === 50, `Se esperaba 50 y se obtuvo ${valor}`);
});

test('AuditLog._toSafeInt aplica limites min/max', () => {
    const bajo = AuditLog._toSafeInt('-10', 50, { min: 1, max: 100 });
    const alto = AuditLog._toSafeInt('999', 50, { min: 1, max: 100 });
    assert(bajo === 1, `Se esperaba 1 y se obtuvo ${bajo}`);
    assert(alto === 100, `Se esperaba 100 y se obtuvo ${alto}`);
});

test('verifyToken permite request con token valido', () => {
    const req = crearReqConToken({ id: 10, role: 'admin', username: 'tester' });
    const res = crearRes();
    let nextLlamado = false;

    verifyToken(req, res, () => {
        nextLlamado = true;
    });

    assert(nextLlamado, 'next() debio ejecutarse');
    assert(req.user && req.user.id === 10, 'req.user no fue asignado correctamente');
});

test('verifyToken bloquea request sin token', () => {
    const req = { headers: {} };
    const res = crearRes();
    let nextLlamado = false;

    verifyToken(req, res, () => {
        nextLlamado = true;
    });

    assert(!nextLlamado, 'next() no debio ejecutarse');
    assert(res.statusCode === 401, `Se esperaba 401 y se obtuvo ${res.statusCode}`);
});

test('verifyAdmin permite rol admin', () => {
    const req = { user: { role: 'admin' } };
    const res = crearRes();
    let nextLlamado = false;

    verifyAdmin(req, res, () => {
        nextLlamado = true;
    });

    assert(nextLlamado, 'next() debio ejecutarse para admin');
});

test('verifyAdmin bloquea rol no admin', () => {
    const req = { user: { role: 'usuario' } };
    const res = crearRes();
    let nextLlamado = false;

    verifyAdmin(req, res, () => {
        nextLlamado = true;
    });

    assert(!nextLlamado, 'next() no debio ejecutarse');
    assert(res.statusCode === 403, `Se esperaba 403 y se obtuvo ${res.statusCode}`);
});

test('verifyContador permite rol contador', () => {
    const req = { user: { role: 'contador' } };
    const res = crearRes();
    let nextLlamado = false;

    verifyContador(req, res, () => {
        nextLlamado = true;
    });

    assert(nextLlamado, 'next() debio ejecutarse para contador');
});

test('verifyContador bloquea rol usuario', () => {
    const req = { user: { role: 'usuario' } };
    const res = crearRes();
    let nextLlamado = false;

    verifyContador(req, res, () => {
        nextLlamado = true;
    });

    assert(!nextLlamado, 'next() no debio ejecutarse para usuario');
    assert(res.statusCode === 403, `Se esperaba 403 y se obtuvo ${res.statusCode}`);
});

console.log('\nResumen de pruebas');
console.log(`Aprobadas: ${passed}/${total}`);

if (passed !== total) {
    process.exit(1);
}
