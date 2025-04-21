<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth클라이언트 구조체를 정의한다.
 *
 * @file /modules/member/dtos/OAuthClient.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2025. 4. 21.
 */
namespace modules\member\dtos;
class OAuthClient
{
    /**
     * @var string $_id OAuth클라이언트고유값
     */
    private string $_id;

    /**
     * @var string $_client_id OAuth클라이언트 아이디
     */
    private string $_client_id;

    /**
     * @var string $_client_secret OAuth클라이언트 비밀키
     */
    private string $_client_secret;

    /**
     * @var string $_auth_url 인증요청 URL
     */
    private string $_auth_url;

    /**
     * @var string $_token_url 토큰요청 URL
     */
    private string $_token_url;

    /**
     * @var string $_token_path 토큰발급 경로
     */
    private string $_token_path;

    /**
     * @var string[] $_scope 접근범위
     */
    private array $_scope;

    /**
     * @var string[] $_scope 접근범위
     */
    private array $_user_scope;

    /**
     * @var string $_scope_separator 접근범위 구분값
     */
    private string $_scope_separator;

    /**
     * @var string $_user_url 유저정보요청 URL
     */
    private string $_user_url;

    /**
     * @var string $_user_id_path 유저고유값경로
     */
    private string $_user_id_path;

    /**
     * @var string $_user_email_path 유저이메일경로
     */
    private string $_user_email_path;

    /**
     * @var string $_user_name_path 유저이름경로
     */
    private string $_user_name_path;

    /**
     * @var string $_user_nickname_path 유저닉네임경로
     */
    private string $_user_nickname_path;

    /**
     * @var string $_user_photo_path 유저프로필이미지경로
     */
    private string $_user_photo_path;

    /**
     * @var bool $_allow_signup 회원가입허용여부
     */
    private bool $_allow_signup;

    /**
     * @var int $_sort 정렬
     */
    private int $_sort = 0;

    /**
     * OAuth클라이언트 구조체를 정의한다.
     *
     * @param object $client OAuth클라이언트
     */
    public function __construct(object $client)
    {
        $this->_id = $client->oauth_id;
        $this->_client_id = $client->client_id;
        $this->_client_secret = $client->client_secret;
        $this->_auth_url = $client->auth_url;
        $this->_token_url = $client->token_url;
        $this->_token_path = $client->token_path;
        $this->_scope = $client->scope ? explode("\n", $client->scope) : [];
        $this->_user_scope = $client->user_scope ? explode("\n", $client->user_scope) : [];
        $this->_scope_separator = $client->scope_separator;
        $this->_user_url = $client->user_url;
        $this->_user_id_path = $client->user_id_path;
        $this->_user_email_path = $client->user_email_path;
        $this->_user_name_path = $client->user_name_path;
        $this->_user_nickname_path = $client->user_nickname_path;
        $this->_user_photo_path = $client->user_photo_path;
        $this->_allow_signup = $client->allow_signup == 'TRUE';
        $this->_sort = $client->sort;
    }

    /**
     * 고유값을 가져온다.
     *
     * @return int $id
     */
    public function getId(): string
    {
        return $this->_id;
    }

    /**
     * 클라이언트 아이디를 가져온다.
     *
     * @return string $client_id
     */
    public function getClientId(): string
    {
        return $this->_client_id;
    }

    /**
     * 클라이언트 비밀키를 가져온다.
     *
     * @return string $client_secret
     */
    public function getClientSecret(): string
    {
        return $this->_client_secret;
    }

    /**
     * 인증요청 URL을 가져온다.
     *
     * @return string $auth_url
     */
    public function getAuthUrl(): string
    {
        return $this->_auth_url;
    }

    /**
     * 토큰요청 URL을 가져온다.
     *
     * @return string $token_url
     */
    public function getTokenUrl(): string
    {
        return $this->_token_url;
    }

    /**
     * 토큰발급 경로를 가져온다.
     *
     * @return string $token_url
     */
    public function getTokenPath(): string
    {
        return $this->_token_path;
    }

    /**
     * 요청범위를 인증요청 URL 에 사용할 문자열로 가져온다.
     *
     * @return string $scope
     */
    public function getScope(): string
    {
        return implode($this->getScopeSeparator(), $this->_scope);
    }

    /**
     * 요청범위를 인증요청 URL 에 사용할 문자열로 가져온다.
     *
     * @return string $scope
     */
    public function getUserScope(): string
    {
        return implode($this->getScopeSeparator(), $this->_user_scope);
    }

    /**
     * 요청범위 구분자를 가져온다.
     *
     * @return string $separators
     */
    public function getScopeSeparator(): string
    {
        $separators = ['COMMA' => ',', 'SPACE' => ' ', 'COLONS' => ':', 'SEMICOLONS' => ';', 'PLUS' => '+'];
        return $separators[$this->_scope_separator];
    }

    /**
     * 유저정보요청 URL을 배열로 가져온다.
     *
     * @return string $user_url
     */
    public function getUserUrl(): string
    {
        return $this->_user_url;
    }

    /**
     * 유저고유값경로를 가져온다.
     *
     * @return string $user_id_path
     */
    public function getUserIdPath(): string
    {
        return $this->_user_id_path;
    }

    /**
     * 유저이메일경로를 가져온다.
     *
     * @return string $user_email_path
     */
    public function getUserEmailPath(): string
    {
        return $this->_user_email_path;
    }

    /**
     * 유저이름경로를 가져온다.
     *
     * @return string $user_name_path
     */
    public function getUserNamePath(): string
    {
        return $this->_user_name_path ?? 'NONE';
    }

    /**
     * 유저닉네임경로를 가져온다.
     *
     * @return string $user_nickname_path
     */
    public function getUserNickNamePath(): string
    {
        return $this->_user_name_path ?? 'NONE';
    }

    /**
     * 유저프로필이미지경로를 가져온다.
     *
     * @return string $user_photo_path
     */
    public function getUserPhotoPath(): string
    {
        return $this->_user_photo_path ?? 'NONE';
    }

    /**
     * 회원가입이 허용되어 있는지 여부를 가져온다.
     *
     * @return bool $allow_signup
     */
    public function isAllowSignup(): bool
    {
        return $this->_allow_signup;
    }
}
