<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 토큰 목록을 가져온다.
 *
 * @file /modules/member/processes/oauth.tokens.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 3.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if (
    $me
        ->getAdmin()
        ->getAdministrator()
        ?->isMaster() !== true
) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$oauth_id = Request::get('oauth_id', true);

$client = $me->getOAuthClient($oauth_id);

$sorters = Request::getJson('sorters');
$start = Request::getInt('start') ?? 0;
$limit = Request::getInt('limit') ?? 50;

$tokens = $me
    ->db()
    ->select()
    ->from($me->table('oauth_tokens'))
    ->where('oauth_id', $oauth_id);
$total = $tokens->copy()->count();

$tokens->limit($start, $limit);
if ($sorters !== null) {
    foreach ($sorters as $field => $direction) {
        $tokens->orderBy($field, $direction);
    }
}
$tokens = $tokens->get();

foreach ($tokens as &$token) {
    $member = $me->getMember($token->member_id);

    $token->email = $member->getEmail();
    $token->name = $member->getName();
    $token->photo = $member->getPhoto();
    $scope = explode("\n", $token->scope);
    $token->scope = count(explode($client->getScopeSeparator(), $token->scope));
}

$results->success = true;
$results->records = $tokens;
$results->total = $total;
