module.exports = grammar({
  name: 'sql',

  extras: $ => [/\s\n/, /\s/, $.comment],

  rules: {
    program: $ => seq(
      $.statement,
      // TODO: other kinds of definitions
    ),

    keyword_select: _ => make_keyword("select"),
    keyword_from: _ => make_keyword("from"),
    keyword_where: _ => make_keyword("where"),
    keyword_order_by: _ => make_keyword("order by"),
    keyword_desc: _ => make_keyword("desc"),
    keyword_asc: _ => make_keyword("asc"),
    keyword_limit: _ => make_keyword("limit"),
    keyword_offset: _ => make_keyword("offset"),

    comment: $ => /--.*\n/,

    statement: $ => choice(
      $._select_statement,
    ),

    _select_statement: $ => seq(
      $.select,
      optional($.from),
      ';',
    ),

    select: $ => seq(
      $.keyword_select,
      $.select_expression,
    ),

    select_expression: $ => choice(
      '*',
      $._field_list,
    ),

    _field_list: $ => seq(
      $.field,
      repeat(
        seq(
          ',',
          $.field,
        ),
      ),
    ),

    field: $ => choice(
      seq(
        optional(
          seq(
            field('table_alias', $.identifier),
            '.',
          ),
        ),
        field('name', $.identifier),
      ),
      prec(2, $._number),
    ),

    from: $ => seq(
      $.keyword_from,
      $.table_expression,
      optional($.where),
      optional($.order_by),
      optional($.limit),
    ),

    table_expression: $ => seq(
      field('name', $.identifier),
      optional(field('table_alias', $.identifier)),
    ),

    where: $ => seq(
      $.keyword_where,
      $.where_expression,
    ),

    order_by: $ => seq(
      $.keyword_order_by,
      $.field,
      $.direction,
    ),

    limit: $ => seq(
      $.keyword_limit,
      $.literal,
      optional($.offset),
    ),

    offset: $ => seq(
      $.keyword_offset,
      $.literal,
    ),

    where_expression: $ => seq(
      $.predicate,
      repeat(
        seq(
          'AND',
          $.predicate,
        ),
      ),
    ),

    predicate: $ => seq(
      $.field,
      $.operator,
      $.literal,
    ),

    operator: $ => choice(
      '=',
      '>',
      '<',
    ),

    direction: $ => choice(
      $.keyword_desc,
      $.keyword_asc,
    ),

    literal: $ => choice(
      $._number,
      $._string,
    ),

    identifier: $ => choice(
      $._string,
      $._number,
    ),

    _string: _ => /([a-zA-Z_$][0-9a-zA-Z_]*)/,
    _number: _ => /\d+/,
  }

});

function make_keyword(word) {
  return new RegExp(word + "|" + word.toUpperCase());
}
