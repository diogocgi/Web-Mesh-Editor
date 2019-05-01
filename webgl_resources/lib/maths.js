//////////////////////////////////////////////////////////////////////////////
//
//  Mathematical functions
//
//  Ref. Original code from the Angel / Shreiner examples
//
//	Additional functions by J. Madeira - Sep./Oct. 2015
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Helper functions
//

function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

//----------------------------------------------------------------------------

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}

function vec3()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    }

    return result.splice( 0, 3 );
}

function vec4()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
    }

    return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec2( v[0],  0.0 ),
            vec2(  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec2(v) );  v.splice( 0, 2 );
        m.push( vec2(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat3()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec3( v[0],  0.0,  0.0 ),
            vec3(  0.0, v[0],  0.0 ),
            vec3(  0.0,  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat4()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec4( v[0], 0.0,  0.0,   0.0 ),
            vec4( 0.0,  v[0], 0.0,   0.0 ),
            vec4( 0.0,  0.0,  v[0],  0.0 ),
            vec4( 0.0,  0.0,  0.0,  v[0] )
        ];
        break;

    default:
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

function equal( u, v )
{
    if ( u.length != v.length ) { return false; }

    if ( u.matrix && v.matrix ) {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) { return false; }
            for ( var j = 0; j < u[i].length; ++j ) {
                if ( u[i][j] !== v[i][j] ) { return false; }
            }
        }
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        return false;
    }
    else {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i] !== v[i] ) { return false; }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

function add( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "add(): trying to add matrices of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "add(): trying to add matrices of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] + v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        throw "add(): trying to add matrix and non-matrix variables";
    }
    else {
        if ( u.length != v.length ) {
            throw "add(): vectors are not the same dimension";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] + v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------
// subtracts matrices or vectors
function subtract( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "subtract(): trying to subtract matrices" +
                " of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "subtract(): trying to subtact matrices" +
                    " of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] - v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        throw "subtact(): trying to subtact  matrix and non-matrix variables";
    }
    else {
        if ( u.length != v.length ) {
            throw "subtract(): vectors are not the same length";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] - v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function mult( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "mult(): trying to add matrices of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "mult(): trying to add matrices of different dimensions";
            }
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( [] );

            for ( var j = 0; j < v.length; ++j ) {
                var sum = 0.0;
                for ( var k = 0; k < u.length; ++k ) {
                    sum += u[i][k] * v[k][j];
                }
                result[i].push( sum );
            }
        }

        result.matrix = true;

        return result;
    }
    else {
        if ( u.length != v.length ) {
            throw "mult(): vectors are not the same dimension";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] * v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
    if ( !m.matrix ) {
        return "transpose(): trying to transpose a non-matrix";
    }

    var result = [];
    for ( var i = 0; i < m.length; ++i ) {
        result.push( [] );
        for ( var j = 0; j < m[i].length; ++j ) {
            result[i].push( m[j][i] );
        }
    }

    result.matrix = true;

    return result;
}

//----------------------------------------------------------------------------
//
//  Helper function: Column-major 1D representation
//

function flatten( v )
{
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}

//----------------------------------------------------------------------------
//
//  To get the number of bytes
//

var sizeof = {
    'vec2' : new Float32Array( flatten(vec2()) ).byteLength,
    'vec3' : new Float32Array( flatten(vec3()) ).byteLength,
    'vec4' : new Float32Array( flatten(vec4()) ).byteLength,
    'mat2' : new Float32Array( flatten(mat2()) ).byteLength,
    'mat3' : new Float32Array( flatten(mat3()) ).byteLength,
    'mat4' : new Float32Array( flatten(mat4()) ).byteLength
};

//----------------------------------------------------------------------------
//
//  Constructing the 4 x 4 transformation matrices - J. Madeira
//

function rotationXXMatrix( degrees )
{
	m = mat4();

	m[1][1] = Math.cos( radians( degrees ) );

	m[1][2] = -Math.sin( radians( degrees ) );

	m[2][1] = Math.sin( radians( degrees ) );

	m[2][2]	= Math.cos( radians( degrees ) )

	return m;
}

function rotationYYMatrix( degrees )
{
	m = mat4();

	m[0][0] = Math.cos( radians( degrees ) );

	m[0][2] = Math.sin( radians( degrees ) );

	m[2][0] = -Math.sin( radians( degrees ) );

	m[2][2]	= Math.cos( radians( degrees ) )

	return m;
}

function rotationZZMatrix( degrees )
{
	m = mat4();

	m[0][0] = Math.cos( radians( degrees ) );

	m[0][1] = -Math.sin( radians( degrees ) );

	m[1][0] = Math.sin( radians( degrees ) );

	m[1][1]	= Math.cos( radians( degrees ) )

	return m;
}

function scalingMatrix( sx, sy, sz )
{
	m = mat4();

	m[0][0] = sx;

	m[1][1] = sy;

	m[2][2] = sz;

	return m;
}

function translationMatrix( tx, ty, tz )
{
	m = mat4();

	m[0][3] = tx;

	m[1][3] = ty;

	m[2][3] = tz;

	return m;
}

//  Projection Matrix Generators - Angel / Shreiner
function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho(): left and right are equal"; }
    if ( bottom == top ) { throw "ortho(): bottom and top are equal"; }
    if ( near == far )   { throw "ortho(): near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4();

    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;

    return result;
}

function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4();

    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

/**
 * https://github.com/toji/gl-matrix/blob/master/src/mat4.js
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function inverseMat4(a) {

    let a00 = a[0][0], a01 = a[0][1], a02 = a[0][2], a03 = a[0][3];
    let a10 = a[1][0], a11 = a[1][1], a12 = a[1][2], a13 = a[1][3];
    let a20 = a[2][0], a21 = a[2][1], a22 = a[2][2], a23 = a[2][3];
    let a30 = a[3][0], a31 = a[3][1], a32 = a[3][2], a33 = a[3][3];

    //console.log(a[0][0]);

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det)
    {
        return null;
    }

    det = 1.0 / det;

    let out = mat4();   // output matrix

    out[0][0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[0][1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[0][2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[0][3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[1][0] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[1][1] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[1][2] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[1][3] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[2][0] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[2][1] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[2][2] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[2][3] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[3][0] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[3][1] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[3][2] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[3][3] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

function multMat3WithVec3(mat, vec) {

    let out = vec3();

    out[0] = mat[0][0]*vec[0] + mat[0][1]*vec[1] + mat[0][2]*vec[2] + mat[0][3]*vec[3];
    out[1] = mat[1][0]*vec[0] + mat[1][1]*vec[1] + mat[1][2]*vec[2] + mat[1][3]*vec[3];
    out[2] = mat[2][0]*vec[0] + mat[2][1]*vec[1] + mat[2][2]*vec[2] + mat[2][3]*vec[3];

    return out;
}

function multMat4WithVec4(mat, vec) {

    let out = vec4();

    out[0] = mat[0][0]*vec[0] + mat[0][1]*vec[1] + mat[0][2]*vec[2] + mat[0][3]*vec[3];
    out[1] = mat[1][0]*vec[0] + mat[1][1]*vec[1] + mat[1][2]*vec[2] + mat[1][3]*vec[3];
    out[2] = mat[2][0]*vec[0] + mat[2][1]*vec[1] + mat[2][2]*vec[2] + mat[2][3]*vec[3];
    out[3] = mat[3][0]*vec[0] + mat[3][1]*vec[1] + mat[3][2]*vec[2] + mat[3][3]*vec[3];

    return out;
}

// vec é um vec3()
function normalizeVec3(vec) {

    // magnitude do vector
    let sqrt = vec3Magnitude(vec);

    // retornar vetor normalizado
    return vec3(vec[0]/sqrt, vec[1]/sqrt, vec[2]/sqrt);
}

function crossProductVec3(vecA, vecB) {

    let vecC = vec3();

    /*
     * vecA[0] vecA[1] vecA[2]  vecA[0] vecA[1] vecA[2]
     *                \ /     \ /     \ /
     *                /\      /\      /\
     * vecB[0] vecB[1] vecB[2]  vecB[0] vecB[1] vecB[2]
     *
    */

    vecC[0] = vecA[1] * vecB[2] - vecA[2] * vecB[1];
    vecC[1] = vecA[2] * vecB[0] - vecA[0] * vecB[2];
    vecC[2] = vecA[0] * vecB[1] - vecA[1] * vecB[0];

    return vecC;
}

function vec3Magnitude(vec) {
    return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
}

function distanceBetween3DPoints(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA[0]-pointB[0], 2) + Math.pow(pointA[1]-pointB[1], 2) + Math.pow(pointA[2]-pointB[2], 2));
}
